// Hydration survival gate.
//
// NOTE: comments here are intentionally ASCII-only. scripts/ is scanned by
// font-subset-config.mjs, so a non-ASCII character would change the shipped font
// subset and force a fonts:subset regeneration.
//
// WHAT THIS MEASURES, AND WHY NOT CHARACTER COUNTS
// ---------------------------------------------------------------------------
// The prerendered body is injected after <div id="app"> and deleted on mount
// (src/utils/prerenderFallback.ts). That is only safe if the app draws the same
// prose back. When it does not, the crawler and the reader get different bodies
// - a cloaking-adjacent shape, and an AdSense reviewer (who runs JavaScript)
// sees a calculator with no article at all.
//
// The previous check for this was a character-count ratio: rendered chars over
// prerendered chars. It cannot detect the defect. On 2026-08-26 five live routes
// scored 95-208% on that ratio while ZERO of their prerendered sentences were
// still in the DOM - a calculator screen simply writes a similar VOLUME of
// different words. Ratios measure bulk; this gate measures identity.
//
// So the unit is a sentence: every >=30-character sentence of the prerendered
// article must still be findable in the hydrated DOM. Whitespace is squashed on
// both sides before comparing, because the app re-renders the same sentence
// through different elements and wraps it differently.
//
// Two assertions per route, both required:
//   1. the prerendered blocks are actually gone after mount (otherwise the
//      measurement would be reading the copy that is about to be deleted and
//      would report a false 100%);
//   2. at least SURVIVAL_FLOOR of those sentences are somewhere in the DOM.
import { createServer } from "node:http";
import { createRequire } from "node:module";
import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, extname, join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { SEO_ROUTES } from "./seo-routes.mjs";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright-core");

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const distRoot = resolve(projectRoot, "dist");

// Matches the live floor used for the audit. A route below this is serving the
// crawler prose the reader never sees.
const SURVIVAL_FLOOR = 0.9;
const MIN_SENTENCE_CHARS = 30;

// Vercel serves this app under /card (see vercel.json rewrites + base: "/card/"
// in vite.config.ts), so the local server has to reproduce the prefix or every
// asset URL in the built HTML 404s.
const BASE_PREFIX = "/card";

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
};

function resolveFile(urlPath) {
  let path = decodeURIComponent(urlPath.split("?")[0]);
  if (path === BASE_PREFIX || path === `${BASE_PREFIX}/`) path = "/";
  else if (path.startsWith(`${BASE_PREFIX}/`)) path = path.slice(BASE_PREFIX.length);

  const candidate = resolve(distRoot, `.${path}`);
  // Never serve outside dist, even though this only ever answers localhost.
  if (candidate !== distRoot && !candidate.startsWith(distRoot + sep)) return null;
  if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;

  // cleanUrls: /fuel-card -> dist/fuel-card/index.html
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
    response.writeHead(200, {
      "content-type": MIME[extname(file)] ?? "application/octet-stream",
    });
    response.end(readFileSync(file));
  });

  return new Promise((resolveServer) => {
    server.listen(0, "127.0.0.1", () => resolveServer(server));
  });
}

// Block-level tags become line breaks so a heading never runs into the
// paragraph under it. The em dash is treated the same way: the prerender writes
// "<strong>lead-in</strong> - body" inside one <li>, while the views render the
// two halves as separate elements, so joining them would report a loss that did
// not happen.
const BLOCK_END =
  /<\/(p|li|h1|h2|h3|h4|h5|h6|td|th|div|section|article|blockquote|dd|dt|figcaption|ol|ul)>|<br\s*\/?>/gi;

function htmlToLines(html) {
  return html
    .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
    .replace(BLOCK_END, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .split("\n");
}

export function sentencesFrom(html) {
  const sentences = [];
  for (const line of htmlToLines(html)) {
    for (const chunk of line.split(/\s—\s/)) {
      for (const raw of chunk.split(/(?<=[.!?])\s+/)) {
        const sentence = raw.replace(/\s+/g, " ").trim();
        if (sentence.length >= MIN_SENTENCE_CHARS) sentences.push(sentence);
      }
    }
  }
  return sentences;
}

const squash = (value) => value.replace(/\s+/g, "");

// The page's OWN prerendered body only - never the shared header/footer/nav,
// which Vue redraws for free and would inflate every route's score.
function prerenderedBody(html) {
  return [
    ...html.matchAll(
      /<(article|section)[^>]*\bdata-seo-prerender\b[^>]*>([\s\S]*?)<\/\1>/gi,
    ),
  ]
    .map(([, , inner]) => inner)
    .join("\n");
}

function staticFileFor(route) {
  const file = resolve(distRoot, route.slice(1), "index.html");
  if (!existsSync(file)) {
    throw new Error(`No static output for ${route} - run the build first`);
  }
  return readFileSync(file, "utf8");
}

const server = await startServer();
const origin = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });

// Analytics, AdSense and Kakao are third parties whose availability must not
// decide whether this gate passes.
await context.route("**", (route) => {
  const url = route.request().url();
  return url.startsWith(origin) ? route.continue() : route.abort();
});

const failures = [];
const rows = [];

try {
  for (const route of SEO_ROUTES) {
    const sentences = sentencesFrom(prerenderedBody(staticFileFor(route)));
    if (sentences.length === 0) {
      failures.push(`${route}: prerendered body has no sentence of ${MIN_SENTENCE_CHARS}+ characters`);
      continue;
    }

    const page = await context.newPage();
    await page.goto(`${origin}${BASE_PREFIX}${route === "/" ? "" : route}`, {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });

    // Assertion 1: mounted AND the prerendered copy deleted. Measuring before
    // the removal would read the doomed copy and report a false 100%.
    try {
      await page.waitForFunction(
        () =>
          (document.querySelector("#app")?.children.length ?? 0) > 0 &&
          document.querySelectorAll("body > [data-seo-prerender]").length === 0,
        undefined,
        { timeout: 20000 },
      );
    } catch {
      await page.close();
      failures.push(`${route}: app never mounted or never cleared the prerendered blocks`);
      continue;
    }

    const dom = squash(htmlToLines(await page.evaluate(() => document.body.innerHTML)).join(" "));
    await page.close();

    const missing = sentences.filter((sentence) => !dom.includes(squash(sentence)));
    const rate = (sentences.length - missing.length) / sentences.length;
    rows.push({ route, total: sentences.length, missing: missing.length, rate });

    if (rate < SURVIVAL_FLOOR) {
      const samples = missing.slice(0, 5).map((sentence) => `      - ${sentence.slice(0, 110)}`);
      failures.push(
        `${route}: ${(rate * 100).toFixed(1)}% of ${sentences.length} prerendered sentences survived hydration ` +
          `(floor ${(SURVIVAL_FLOOR * 100).toFixed(0)}%), ${missing.length} missing:\n${samples.join("\n")}`,
      );
    }
  }
} finally {
  await browser.close();
  server.close();
}

for (const { route, total, missing, rate } of rows) {
  console.log(
    `  ${route.padEnd(32)} ${String(total - missing).padStart(3)}/${String(total).padEnd(3)} sentences  ${(rate * 100).toFixed(1)}%`,
  );
}

if (failures.length > 0) {
  console.error(`\nHydration survival gate failed on ${failures.length} route(s):`);
  for (const failure of failures) console.error(`  ${failure}`);
  process.exit(1);
}

const worst = rows.reduce((low, row) => Math.min(low, row.rate), 1);
console.log(
  `Hydration survival: ${rows.length} routes, worst ${(worst * 100).toFixed(1)}% ` +
    `(floor ${(SURVIVAL_FLOOR * 100).toFixed(0)}%).`,
);
