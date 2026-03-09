// sitemap.xml 생성
import { writeFileSync, mkdirSync, existsSync } from "fs";
import { resolve } from "path";
import { SEO_ROUTES } from "./seo-routes.mjs";

const SITE_URL = "https://car.shakilabs.com";
const DIST_DIR = resolve(import.meta.dirname, "../dist");
const PUBLIC_DIR = resolve(import.meta.dirname, "../public");

const today = new Date().toISOString().split("T")[0];

function resolvePriority(route) {
  if (route === "/fuel-card") return "1.0";
  if (/^\/fuel-card\/(hyundai|shinhan|kb|samsung|lotte|hana)$/.test(route)) return "0.8";
  if (/^\/fuel-card\/(gasoline|diesel)$/.test(route)) return "0.7";
  if (route.startsWith("/fuel-card/monthly/")) return "0.6";
  return "0.3";
}

function resolveChangeFreq(route) {
  if (route === "/fuel-card") return "weekly";
  if (/^\/fuel-card\/(gasoline|diesel)$/.test(route)) return "weekly";
  if (/^\/fuel-card\/(hyundai|shinhan|kb|samsung|lotte|hana)$/.test(route)) return "monthly";
  if (route.startsWith("/fuel-card/monthly/")) return "monthly";
  return "yearly";
}

const urls = SEO_ROUTES.map((route) => `  <url>
    <loc>${SITE_URL}${route}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${resolveChangeFreq(route)}</changefreq>
    <priority>${resolvePriority(route)}</priority>
  </url>`).join("\n");

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

if (!existsSync(PUBLIC_DIR)) {
  mkdirSync(PUBLIC_DIR, { recursive: true });
}
writeFileSync(resolve(PUBLIC_DIR, "sitemap.xml"), sitemap, "utf-8");

if (existsSync(DIST_DIR)) {
  writeFileSync(resolve(DIST_DIR, "sitemap.xml"), sitemap, "utf-8");
}

console.log(`[sitemap] Generated with ${SEO_ROUTES.length} URLs`);
