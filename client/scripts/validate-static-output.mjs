import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  SEO_ROUTES,
  SITEMAP_ROUTES,
  PARAM_ROUTES,
  VARIANT_SUBGROUPS,
  canonicalPathFor,
} from "./seo-routes.mjs";

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

// Mirrors the prerender step: variant routes canonicalize to their family base,
// every other route is self-canonical. Both sides read canonicalPathFor from
// seo-routes.mjs, so the expectation cannot drift away from what was emitted.
function canonicalFor(route) {
  const path = canonicalPathFor(route);
  return path === "/" ? canonicalBase : canonicalBase + path;
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
    let parsed;
    try {
      parsed = JSON.parse(body);
    } catch (error) {
      throw new Error(`Unparsable JSON-LD on ${route}: ${error.message}`);
    }

    for (const entity of Array.isArray(parsed) ? parsed : [parsed]) {
      assertSelfDescribingUrl(entity, route);
    }
  }
}

// Types whose top-level "url" is a claim about THIS page. BreadcrumbList and
// ItemList are excluded on purpose: their URLs legitimately point elsewhere.
const SELF_DESCRIBING_TYPES = new Set([
  "WebApplication",
  "SoftwareApplication",
  "WebPage",
  "WebSite",
]);

// A self-describing entity that names a different URL than the page's canonical
// tells a crawler this page is some other page. index.html used to ship a static
// WebApplication hardcoded to /card/fuel-card, so all 34 routes claimed to be
// the fuel card calculator; nothing failed because nothing checked. On a
// consolidated variant that is worse than noise -- it contradicts the canonical.
function assertSelfDescribingUrl(entity, route) {
  if (!entity || typeof entity !== "object") return;
  if (!SELF_DESCRIBING_TYPES.has(entity["@type"])) return;
  if (typeof entity.url !== "string") return;

  assert(entity.url === canonicalFor(route),
    `JSON-LD ${entity["@type"]} on ${route} claims url ${entity.url} but the page canonicalizes to ${canonicalFor(route)}`);
}

// Runs over SEO_ROUTES, not SITEMAP_ROUTES: a consolidated variant must keep
// shipping a real static file even though the sitemap no longer lists it.
// Serving the empty SPA shell there would be a soft-404 for crawlers.
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
  const expected = SITEMAP_ROUTES.map(canonicalFor);
  assert(JSON.stringify(actual) === JSON.stringify(expected),
    "Sitemap routes do not match the self-canonical routes");

  // Explicit guard rather than relying on the equality above: if someone ever
  // reorders SITEMAP_ROUTES this still fails loudly when a canonicalized
  // variant sneaks back into the sitemap.
  const variantUrls = new Set(PARAM_ROUTES.map((route) => canonicalBase + route));
  const leaked = actual.filter((url) => variantUrls.has(url));
  assert(leaked.length === 0,
    `Sitemap must not list canonicalized variants: ${leaked.join(", ")}`);
}

// Consolidation is only real if every variant actually points at its base and
// the base itself stays self-canonical (a canonical chain would waste the
// signal). Reads the emitted files, not the config that produced them.
function validateConsolidation() {
  const bases = new Set();

  // Per-subgroup rather than over the flat variant list: the failure this guards
  // against is a whole subgroup silently losing its mapping (for example if a
  // future refactor pattern-matches "/fuel-card/:x" and quietly drops the
  // two-segment monthly routes). An aggregate count would still look plausible.
  for (const { id, base, routes } of VARIANT_SUBGROUPS) {
    assert(routes.length > 0, `Variant subgroup ${id} is empty`);
    for (const route of routes) {
      assert(canonicalPathFor(route) === base,
        `Variant subgroup ${id}: ${route} must map to ${base}, got ${canonicalPathFor(route)}`);
      assert(PARAM_ROUTES.includes(route),
        `Variant subgroup ${id}: ${route} is missing from PARAM_ROUTES`);
      assert(SEO_ROUTES.includes(route),
        `Variant subgroup ${id}: ${route} must stay prerendered to avoid a soft-404`);
    }
  }

  const mappedRoutes = VARIANT_SUBGROUPS.flatMap(({ routes }) => routes);
  assert(mappedRoutes.length === PARAM_ROUTES.length,
    `Every variant must belong to exactly one subgroup (${mappedRoutes.length} mapped vs ${PARAM_ROUTES.length} variants)`);

  for (const route of PARAM_ROUTES) {
    const html = readFileSync(outputPathFor(route), "utf8");
    const base = canonicalPathFor(route);
    assert(base !== route, `${route} is listed as a variant but canonicalizes to itself`);
    assert(canonicalFrom(html) === canonicalBase + base,
      `${route} must canonicalize to ${canonicalBase + base}`);
    assert(!/name="robots" content="noindex/.test(html),
      `${route} must not be noindex - canonical and noindex are conflicting signals`);
    bases.add(base);
  }

  for (const base of bases) {
    const html = readFileSync(outputPathFor(base), "utf8");
    assert(canonicalFrom(html) === canonicalBase + base,
      `Canonical target ${base} must be self-canonical`);
    assert(SITEMAP_ROUTES.includes(base),
      `Canonical target ${base} must stay in the sitemap`);
  }
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

  // The 404 screen is a heading and a link. Loading the ad script there puts
  // ads on a page with no content, which AdSense treats as a Valuable Inventory
  // violation. The shell template carries the loader for every other route, so
  // this only stays removed as long as something checks.
  assert(!/googlesyndication\.com|adsbygoogle/i.test(notFoundHtml),
    "404.html must not load the AdSense script (Valuable Inventory: no ads on a contentless screen)");
}

// The AdSense review requires the privacy policy to disclose third-party ad
// cookies and to offer an opt-out. Both opt-out destinations are load-bearing:
// Google's own setting page covers Google, aboutads.info covers everyone else.
// They live in a single content source now, so a careless edit could drop them
// from the static file and the rendered page at the same time.
function validatePolicyDisclosures() {
  const privacy = readFileSync(outputPathFor("/privacy"), "utf8");
  const terms = readFileSync(outputPathFor("/terms"), "utf8");

  for (const link of ["https://adssettings.google.com", "https://www.aboutads.info/choices"]) {
    assert(privacy.includes(link), `/privacy must keep the AdSense opt-out link ${link}`);
  }
  assert(/제3자 광고 사업자/.test(privacy),
    "/privacy must disclose third-party ad cookies");
  assert(/맞춤 광고/.test(privacy),
    "/privacy must explain personalized advertising");
  assert(terms.includes('href="/card/privacy"'),
    "/terms must point at the privacy policy for the ad cookie disclosure");
}

// Visible text of the page's OWN prerendered body -- only the
// <article data-seo-prerender> blocks, never the shared header/footer/nav.
//
// Counting whole-page text is the trap here: shared chrome is worth several
// hundred characters on every route, so a genuinely thin page can clear a
// content floor purely on navigation boilerplate. Measuring the article alone
// is also what the audit baseline used (/fuel-card measures 3,059 either way,
// but /all was 322 only because chrome was excluded).
function prerenderedBodyChars(html) {
  const articles = [
    ...html.matchAll(/<article[^>]*\bdata-seo-prerender\b[^>]*>([\s\S]*?)<\/article>/gi),
  ];

  return articles
    .map(([, inner]) =>
      inner
        .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
        .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
        .replace(/<[^>]+>/g, " ")
        .replace(/&[a-z]+;/gi, " ")
        .replace(/\s+/g, " ")
        .trim(),
    )
    .reduce((total, text) => total + text.length, 0);
}

// Pages that receive canonical signals must not themselves be thin: a hub or a
// consolidation target that reads as a bare link list wastes the authority the
// variants hand it. 1,500 characters is the floor used across the apps.
const THIN_CONTENT_FLOOR = 1500;

function validateContentDepth() {
  // Every URL the sitemap advertises has to clear the floor, not just the hubs.
  // The earlier target set (home, /all, consolidation targets) let /terms and
  // /privacy ship at 949 and 1,198 characters -- the two pages an AdSense
  // reviewer opens first. Widening the set is what keeps that from recurring.
  const targets = new Set([...SITEMAP_ROUTES, ...PARAM_ROUTES.map(canonicalPathFor)]);

  for (const route of targets) {
    const chars = prerenderedBodyChars(readFileSync(outputPathFor(route), "utf8"));
    assert(chars >= THIN_CONTENT_FLOOR,
      `${route} prerenders only ${chars} chars of body text, below the ${THIN_CONTENT_FLOOR} floor`);
  }
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
validateConsolidation();
validateContentDepth();
validateHome();
validateAliasesAndNotFound();
validatePolicyDisclosures();
validateFuelTypeContent();

console.log(
  `Validated ${SEO_ROUTES.length} card routes ` +
    `(${SITEMAP_ROUTES.length} sitemap + ${PARAM_ROUTES.length} canonicalized variants) ` +
    "and custom 404 output.",
);
