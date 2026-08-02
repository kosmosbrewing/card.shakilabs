import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { SEO_ROUTES } from "./seo-routes.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "..");
const repositoryRoot = resolve(projectRoot, "..");
const distRoot = resolve(projectRoot, "dist");
const canonicalBase = "https://shakilabs.com/card";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function canonicalFrom(html) {
  return html.match(/<link rel="canonical" href="([^"]+)"\s*\/?>/)?.[1];
}

// The home lives at dist/index.html and canonicalizes without a trailing slash.
function outputPathFor(route) {
  return resolve(distRoot, route.slice(1), "index.html");
}

function canonicalFor(route) {
  return route === "/" ? canonicalBase : canonicalBase + route;
}

function validateVercelConfig() {
  const config = JSON.parse(
    readFileSync(resolve(repositoryRoot, "vercel.json"), "utf8"),
  );
  const rewrites = config.rewrites ?? [];
  const pathRewrite = rewrites.find(
    (rewrite) => rewrite.source === "/card/:path*",
  );

  assert(config.cleanUrls === true, "cleanUrls must be true");
  assert(config.trailingSlash === false, "trailingSlash must be false");
  assert(!rewrites.some((rewrite) => rewrite.destination === "/index.html"),
    "index.html catch-all rewrite is forbidden");
  assert(pathRewrite?.destination === "/:path*",
    "card rewrite must preserve the requested path");
}

// Every JSON-LD block must carry its payload in the script body. A block whose
// body is empty (payload leaked into an attribute) is invisible to crawlers.
function validateJsonLd(html, route) {
  const blocks = [
    ...html.matchAll(
      /<script\b([^>]*\btype="application\/ld\+json"[^>]*)>([\s\S]*?)<\/script>/gi,
    ),
  ];

  assert(blocks.length > 0, `Missing JSON-LD for ${route}`);

  for (const [, attributes, body] of blocks) {
    assert(!/\bchildren\s*=/.test(attributes),
      `JSON-LD on ${route} carries a children attribute instead of a body`);
    assert(body.trim().length > 0, `Empty JSON-LD block on ${route}`);
    try {
      JSON.parse(body);
    } catch (error) {
      throw new Error(`Unparsable JSON-LD on ${route}: ${error.message}`);
    }
  }
}

function validateRoutes() {
  const hashes = new Set();

  for (const route of SEO_ROUTES) {
    const outputPath = outputPathFor(route);
    assert(existsSync(outputPath), `Missing static output for ${route}`);

    const html = readFileSync(outputPath, "utf8");
    const expectedCanonical = canonicalFor(route);
    const hash = createHash("sha256").update(html).digest("hex");
    const h1Count = html.match(/<h1\b/gi)?.length ?? 0;

    assert(canonicalFrom(html) === expectedCanonical,
      `Invalid canonical for ${route}`);
    assert(/<title>[^<]+<\/title>/.test(html), `Missing title for ${route}`);
    assert(h1Count === 1, `Expected one H1 for ${route}, found ${h1Count}`);
    assert(
      !/<noscript>/i.test(html),
      `Route-specific output must not retain the shell noscript for ${route}`,
    );
    validateJsonLd(html, route);
    assert(!hashes.has(hash), `Duplicate raw HTML for ${route}`);
    hashes.add(hash);
  }
}

function validateSitemap() {
  const sitemap = readFileSync(resolve(distRoot, "sitemap.xml"), "utf8");
  const actual = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
    ([, url]) => url,
  );
  const expected = SEO_ROUTES.map(canonicalFor);
  assert(JSON.stringify(actual) === JSON.stringify(expected),
    "Sitemap routes do not match static routes");
}

// The home used to ship as the bare Vite shell (no content, no outbound links).
// These checks keep it a real prerendered landing page.
function validateHome() {
  const html = readFileSync(outputPathFor("/"), "utf8");
  const fuelCard = readFileSync(outputPathFor("/fuel-card"), "utf8");
  const allTools = readFileSync(outputPathFor("/all"), "utf8");

  assert(canonicalFrom(html) === canonicalBase,
    `Home must canonicalize to ${canonicalBase} without a trailing slash`);

  const title = html.match(/<title>([^<]+)<\/title>/)?.[1] ?? "";
  const description = html.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? "";
  assert(title.length > 0 && title.length <= 60,
    `Home title must be 1-60 characters, got ${title.length}`);
  assert(description.length > 0 && description.length <= 155,
    `Home description must be 1-155 characters, got ${description.length}`);

  const fuelCardTitle = fuelCard.match(/<title>([^<]+)<\/title>/)?.[1];
  const allToolsTitle = allTools.match(/<title>([^<]+)<\/title>/)?.[1];
  assert(title !== fuelCardTitle && title !== allToolsTitle,
    "Home title must differ from /fuel-card and /all");

  assert(html.includes('data-seo-prerender="card-home"'),
    "Home must ship its own prerendered body content");
  assert(html.includes("카드 혜택, 발급 전에 숫자로 확인하세요"),
    "Home must contain its own H1 copy");

  // Footer cross-app navigation is the reason crawlers reach sibling apps.
  const crossAppLinks = new Set(
    [...html.matchAll(/href="\/(finance|loan|invest|house|car|ott|nutri|seller|biz|travel)"/g)]
      .map(([, app]) => app),
  );
  assert(crossAppLinks.size >= 10,
    `Home must link every sibling app, found ${crossAppLinks.size}`);
}

function validateAliasesAndNotFound() {
  const notFoundPath = resolve(distRoot, "404.html");
  assert(existsSync(notFoundPath), "Missing custom 404.html");
  const notFoundHtml = readFileSync(notFoundPath, "utf8");
  assert(/name="robots" content="noindex,nofollow"/.test(notFoundHtml),
    "404.html must be noindex,nofollow");
  assert(notFoundHtml.includes('href="/card/fuel-card"'),
    "404.html must contain a recovery link");
}

function validateFuelTypeContent() {
  const diesel = readFileSync(resolve(distRoot, "fuel-card/diesel/index.html"), "utf8");
  const lpg = readFileSync(resolve(distRoot, "fuel-card/lpg/index.html"), "utf8");
  assert(lpg.includes("LPG 주유 할인카드 추천 (2026년)"),
    "LPG prerender must contain its own heading");
  assert(lpg.includes("LPG 충전도 주유 할인 대상인가요?"),
    "LPG prerender must contain LPG-specific guidance");
  assert(!lpg.includes("경유 차량 운전자를 위한"),
    "LPG prerender must not reuse diesel guidance");
  assert(lpg !== diesel, "LPG and diesel prerenders must be unique");
}

validateVercelConfig();
validateRoutes();
validateSitemap();
validateHome();
validateAliasesAndNotFound();
validateFuelTypeContent();

console.log(`Validated ${SEO_ROUTES.length} card routes and custom 404 output.`);
