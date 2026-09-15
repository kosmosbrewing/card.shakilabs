// 브랜드 폰트(GmarketSans) 문자셋 수집·검증 — docs/BRAND_FONT_SUBSET.md §3·§6
//
// 왜 소스 grep이 아니라 렌더 결과인가: .vue를 훑으면 주석·속성·문자열까지 세어
// 과대 수집된다(같은 함대의 nutri가 465자/64KB로 부푼 사례).
//
// 왜 정적 HTML이 아니라 브라우저인가: 이 앱의 dist/*.html은 프리렌더 SEO 블록과
// 껍데기뿐이고 계산기 화면(제목·히어로 수치)은 마운트 후에 그려진다.
// verify-hydration-survival.mjs가 증명하듯 프리렌더 본문은 마운트 때 지워진다 —
// 정적 파일만 보면 브랜드 폰트로 찍히는 글자를 거의 다 놓친다.
// (house·nutri는 vite-ssg라 dist HTML이 곧 최종 DOM이고, 거기선 정적 스캔이 같은 답을 낸다.)
//
// 왜 "리프"가 아니라 요소의 직속 텍스트인가: 조상을 세면 다른 폰트로 그려지는 자손
// 텍스트가 딸려 들어오고, 리프만 세면 아이콘(svg) + 텍스트로 된 제목을 통째로 놓친다.
//
// 판정에 document.fonts.check()를 쓰지 마라 — 이 환경 Chromium에서 무엇을 물어도
// true라(뷁·Ω 포함) 실패할 수 없는 게이트가 된다. 판정 근거는 fontTools가 산출물의
// cmap을 읽어 매니페스트에 적어 둔 "실제로 담긴 글자" 전수 대조다(subset-fonts.mjs).
import { createServer } from "node:http";
import { createRequire } from "node:module";
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, extname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { NUMERAL_CHARACTERS, brandFontJob } from "./font-subset-config.mjs";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright-core");

const scriptRoot = dirname(fileURLToPath(import.meta.url));
const clientRoot = resolve(scriptRoot, "..");
const distRoot = resolve(clientRoot, "dist");
const charsetPath = resolve(scriptRoot, "brand-charset.json");
const checkOnly = process.argv.includes("--check");

// Vercel이 이 앱을 /card 아래로 서빙한다(vercel.json rewrites + base: "/card/").
// 프리픽스를 재현하지 않으면 빌드된 HTML의 자산 URL이 전부 404다.
const BASE_PREFIX = "/card";
const MIME = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8", ".json": "application/json; charset=utf-8",
  ".xml": "application/xml; charset=utf-8", ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg",
  ".webp": "image/webp", ".ico": "image/x-icon", ".woff2": "font/woff2", ".woff": "font/woff",
};

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function listFiles(dir, extension) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const child = resolve(dir, entry.name);
    if (entry.isDirectory()) return listFiles(child, extension);
    return extname(child) === extension ? [child] : [];
  });
}

function resolveFile(urlPath) {
  let path = decodeURIComponent(urlPath.split("?")[0]);
  if (path === BASE_PREFIX || path === `${BASE_PREFIX}/`) path = "/";
  else if (path.startsWith(`${BASE_PREFIX}/`)) path = path.slice(BASE_PREFIX.length);
  const candidate = resolve(distRoot, `.${path}`);
  // localhost에만 답하지만 dist 밖은 절대 서빙하지 않는다.
  if (candidate !== distRoot && !candidate.startsWith(distRoot + sep)) return null;
  if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;
  // cleanUrls: /fuel-card -> dist/fuel-card/index.html, /404 -> dist/404.html
  const asHtml = `${candidate}.html`;
  if (existsSync(asHtml) && statSync(asHtml).isFile()) return asHtml;
  const indexed = join(candidate, "index.html");
  return existsSync(indexed) ? indexed : null;
}

function startServer() {
  const server = createServer((request, response) => {
    const file = resolveFile(request.url ?? "/");
    if (!file) {
      response.writeHead(404).end("not found");
      return;
    }
    response.writeHead(200, { "content-type": MIME[extname(file)] ?? "application/octet-stream" });
    response.end(readFileSync(file));
  });
  return new Promise((ready) => server.listen(0, "127.0.0.1", () => ready(server)));
}

const routes = listFiles(distRoot, ".html").map((file) => {
  const relativePath = relative(distRoot, file).replaceAll(sep, "/");
  if (relativePath === "index.html") return "/";
  return `/${relativePath.replace(/\/index\.html$/, "").replace(/\.html$/, "")}`;
}).sort();
assert(routes.length > 0, "No built HTML found; run npm run build first");

const server = await startServer();
const origin = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
// 서드파티(애널리틱스·애드센스)의 가용성이 게이트 결과를 정하면 안 된다.
await context.route("**", (route) => (route.request().url().startsWith(origin)
  ? route.continue()
  : route.abort()));

const rendered = new Set();
let textRuns = 0;
try {
  for (const route of routes) {
    const page = await context.newPage();
    await page.goto(`${origin}${BASE_PREFIX}${route === "/" ? "/" : route}`, {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });
    await page.waitForFunction(() => (document.querySelector("#app")?.children.length ?? 0) > 0,
      undefined, { timeout: 20000 });
    const texts = await page.evaluate(() => {
      const firstFamily = (value) => (value || "").split(",")[0].trim().replace(/^["']|["']$/g, "");
      const found = [];
      for (const element of document.querySelectorAll("*")) {
        if (firstFamily(getComputedStyle(element).fontFamily) !== "GmarketSans") continue;
        const own = [...element.childNodes]
          .filter((node) => node.nodeType === Node.TEXT_NODE)
          .map((node) => node.textContent)
          .join("");
        // ::before/::after의 content도 이 폰트로 그려진다.
        const pseudo = ["::before", "::after"].map((selector) => {
          const content = getComputedStyle(element, selector).content;
          return content && content !== "none" && content !== "normal"
            ? content.replace(/^["']|["']$/g, "")
            : "";
        }).join("");
        const text = own + pseudo;
        if (text.trim()) found.push(text);
      }
      return found;
    });
    await page.close();
    for (const text of texts) {
      textRuns += 1;
      for (const character of text) if (!"\n\r\t".includes(character)) rendered.add(character);
    }
  }
} finally {
  await browser.close();
  server.close();
}

// 카운트업 중간 프레임과 입력에 따라 바뀌는 수치는 렌더 한 장에 다 나오지 않는다.
for (const character of NUMERAL_CHARACTERS) rendered.add(character);
const characters = [...rendered].sort().join("");

const scanLabel = `${routes.length} routes, ${textRuns} text runs`;

if (!checkOnly) {
  writeFileSync(charsetPath, `${JSON.stringify({
    note: "scripts/collect-brand-charset.mjs가 브라우저 렌더 결과에서 만든다. 손으로 고치지 마라.",
    routes: routes.length,
    textRuns,
    characterCount: [...characters].length,
    characters,
  }, null, 2)}\n`);
  console.log(`Collected ${[...characters].length} brand characters from ${routes.length} routes.`);
} else {
  const committed = JSON.parse(readFileSync(charsetPath, "utf8"));
  assert(committed.characters === characters,
    "Rendered brand characters changed; run node scripts/collect-brand-charset.mjs && npm run fonts:subset");
  // 서브셋에 실제로 들어간 글리프 목록은 생성 시점에 fontTools가 산출물에서 읽어
  // 매니페스트에 적는다(scripts/subset-fonts.mjs). 여기서 다시 파이썬을 부르지 않는 이유:
  // 이 검사는 `npm run build`에 얹혀 Vercel·CI에서도 도는데 그쪽엔 fontTools가 없다.
  // 매니페스트↔파일은 verify-fonts의 sha256이, 매니페스트↔문자셋은 아래 대조가 묶는다.
  const manifest = JSON.parse(readFileSync(resolve(scriptRoot, "font-subset-manifest.json"), "utf8"));
  const brandEntry = manifest.fonts.find((font) => font.publicName === brandFontJob.publicName);
  assert(brandEntry, `Font manifest has no entry for ${brandFontJob.publicName}`);
  const shipped = new Set(brandEntry.shippedCharacters ?? "");
  // 원본 폰트에 글리프가 없는 문자(이모지 등)는 서브셋에 담길 수 없다. 글리프 단위
  // 폴백이 정상 동작이라 통과시키되, 조용히 넘기지 않고 이름을 찍는다.
  const dropped = new Set(brandEntry.droppedCharacters ?? "");
  const missing = [...characters].filter((character) =>
    !shipped.has(character) && !dropped.has(character));
  assert(missing.length === 0,
    `Brand subset misses ${missing.length} rendered characters: ${JSON.stringify(missing.join(""))}`);
  const shippedFile = resolve(distRoot, "fonts", brandFontJob.publicName);
  assert(existsSync(shippedFile), `Missing shipped brand font: ${brandFontJob.publicName}`);
  console.log(`Brand font covers ${shipped.size} rendered characters, 0 missing`
    + `${dropped.size ? ` (${JSON.stringify([...dropped].join(""))} absent from the source font: per-glyph fallback)` : ""}`
    + `, ${scanLabel}.`);
}
