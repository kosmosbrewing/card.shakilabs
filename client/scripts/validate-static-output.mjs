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

function validateRoutes() {
  const hashes = new Set();

  for (const route of SEO_ROUTES) {
    const outputPath = resolve(distRoot, route.slice(1), "index.html");
    assert(existsSync(outputPath), `Missing static output for ${route}`);

    const html = readFileSync(outputPath, "utf8");
    const expectedCanonical = canonicalBase + route;
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
    assert(!hashes.has(hash), `Duplicate raw HTML for ${route}`);
    hashes.add(hash);
  }
}

function validateSitemap() {
  const sitemap = readFileSync(resolve(distRoot, "sitemap.xml"), "utf8");
  const actual = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
    ([, url]) => url,
  );
  const expected = SEO_ROUTES.map((route) => canonicalBase + route);
  assert(JSON.stringify(actual) === JSON.stringify(expected),
    "Sitemap routes do not match static routes");
}

function validateAliasesAndNotFound() {
  const rootHtml = readFileSync(resolve(distRoot, "index.html"), "utf8");
  assert(canonicalFrom(rootHtml) === `${canonicalBase}/fuel-card`,
    "Root alias must canonicalize to /card/fuel-card");

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
validateAliasesAndNotFound();
validateFuelTypeContent();

console.log(`Validated ${SEO_ROUTES.length} card routes and custom 404 output.`);
