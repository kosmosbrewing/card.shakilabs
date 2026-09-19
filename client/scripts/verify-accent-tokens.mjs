// Category accent + semantic colour gate (design plan 2026-09-17 4.2 / 4.3).
//
// card, nutri and baby form the "consumer" group and must ship ONE teal accent.
// Judging that from the source alone is not enough: this app declares its palette
// in the inline critical CSS of index.html while other apps declare it in main.css,
// and Tailwind can drop a block that nothing references. So the evidence is the
// build output - dist/index.html plus every dist/assets/*.css - merged the way a
// browser would cascade them.
//
// NOTE: keep this file ASCII-only. scripts/font-subset-config.mjs feeds every
// character under client/scripts into the Pretendard subset, so a Korean comment
// here would change the subset hash and fail the font gate. (house/finance/nutri
// strip comments before collecting; this app does not yet.)
//
// Pure Node on purpose: a build gate must not download a browser or shell out to
// python. Contrast here is computed, not screenshotted.
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptRoot = dirname(fileURLToPath(import.meta.url));
const clientRoot = resolve(scriptRoot, "..");
const distRoot = resolve(clientRoot, "dist");

// The group palette. These literals are the plan's table verbatim; an app never
// recomputes them, otherwise "one teal" drifts into three slightly different teals.
// --accent-foreground is 28%, not the 30% the derivation formula gives: 30% lands
// at 4.37:1 on the tint (below AA) and 28% at 4.92:1. Measurement beats formula.
const EXPECTED = {
  light: {
    "--primary": "174 70% 24%",
    "--primary-foreground": "0 0% 100%",
    "--secondary": "174 15% 91%",
    "--secondary-foreground": "222 47% 11%",
    "--accent": "174 68% 95%",
    "--accent-foreground": "174 70% 28%",
    // Focus ring is ink, not brand (v3 2.1 color.focus). A teal ring makes the
    // "you are here" signal read as decoration and its contrast follows the
    // accent instead of the page. Expected values live here as well as in
    // index.html on purpose: when only one side moves, this gate fails.
    "--ring": "0 0% 3.92%",
  },
  dark: {
    "--primary": "174 70% 45%",
    "--primary-foreground": "174 70% 10%",
    "--secondary": "174 15% 20%",
    "--secondary-foreground": "210 40% 96%",
    "--accent": "174 50% 22%",
    "--accent-foreground": "174 70% 78%",
    "--ring": "0 0% 96.08%",
  },
};

// v3 2.1 fixed semantic colours. Compared as hex so a different HSL spelling of
// the same colour still passes and a different colour never does.
const EXPECTED_STATUS = {
  light: {
    "--status-success": "#1B7A4A",
    "--status-warning": "#B45309",
    "--status-danger": "#C62828",
    "--status-info": "#1D4E8C",
  },
  dark: {
    "--status-success": "#5DCA8E",
    "--status-warning": "#F0B429",
    "--status-danger": "#F07171",
    "--status-info": "#8BB4E8",
  },
};

// Lightness band for the category accent (plan 4.2). Outside it the four group
// colours stop reading as one weight even when the hue is right.
const PRIMARY_L_BAND = { light: [24, 41], dark: [45, 72] };

// Local aliases for colours that already have a canonical token. They are the
// reason the same meaning shipped in two names per app; a build must not carry
// them any more. Declaration names and the utility classes they generate.
const BANNED_PROPERTY = /^--(savings|loss|fee|profit|brand)(-|$)|^--status-caution$/;
const BANNED_CLASS = /\.\\?!?(?:text|bg|border|fill|ring|stroke|divide|outline)-(?:savings|loss|fee|profit|brand)\b/;

// Reference surfaces from v3 2.1. Checked in addition to this app's own
// --card/--background so a local neutral drift cannot hide a failing accent.
const REFERENCE_SURFACES = {
  light: { "v3 card #FFFFFF": "#FFFFFF", "v3 canvas #F7F7F5": "#F7F7F5" },
  dark: { "v3 card #1C1C1C": "#1C1C1C", "v3 canvas #121212": "#121212" },
};

const AA_BODY = 4.5;
const failures = [];
function check(condition, message) {
  if (!condition) failures.push(message);
}

function stripComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, "");
}

/** Every declaration of `selector` in source order; later wins, like the cascade. */
function collectTokens(css, selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const blocks = stripComments(css).matchAll(
    new RegExp(`(?:^|[\\s,{}])${escaped}\\s*\\{([^{}]*)\\}`, "g")
  );
  const tokens = {};
  for (const block of blocks) {
    for (const [, name, value] of block[1].matchAll(/(--[\w-]+)\s*:\s*([^;]+)/g)) {
      tokens[name] = value.trim().replace(/\s+/g, " ");
    }
  }
  return tokens;
}

function hslToRgb(token) {
  const [h, s, l] = String(token).split(/\s+/).map(Number.parseFloat);
  if (![h, s, l].every(Number.isFinite)) throw new Error(`Unparsable hsl token: "${token}"`);
  const sat = s / 100;
  const light = l / 100;
  const a = sat * Math.min(light, 1 - light);
  const channel = (n) => {
    const k = (n + h / 30) % 12;
    return light - a * Math.max(-1, Math.min(k - 3, Math.min(9 - k, 1)));
  };
  return [channel(0), channel(8), channel(4)];
}

function hexToRgb(hex) {
  const clean = hex.replace("#", "");
  return [0, 2, 4].map((i) => Number.parseInt(clean.slice(i, i + 2), 16) / 255);
}

function rgbToHex(rgb) {
  return `#${rgb.map((v) => Math.round(v * 255).toString(16).padStart(2, "0")).join("").toUpperCase()}`;
}

function relativeLuminance([r, g, b]) {
  const linear = (v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
  return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b);
}

function contrast(a, b) {
  const x = relativeLuminance(a);
  const y = relativeLuminance(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

function lightnessOf(token) {
  return Number.parseFloat(String(token).split(/\s+/)[2]);
}

function readBuiltCss() {
  const assetsDir = resolve(distRoot, "assets");
  const parts = [];
  const indexPath = resolve(distRoot, "index.html");
  if (existsSync(indexPath)) parts.push(readFileSync(indexPath, "utf8"));
  if (existsSync(assetsDir)) {
    for (const name of readdirSync(assetsDir).filter((file) => file.endsWith(".css"))) {
      parts.push(readFileSync(resolve(assetsDir, name), "utf8"));
    }
  }
  return parts.join("\n");
}

const sourceIndex = readFileSync(resolve(clientRoot, "index.html"), "utf8");
const builtCss = readBuiltCss();
check(builtCss.length > 0, "Build produced no CSS to verify");

const palettes = {
  light: {
    source: collectTokens(sourceIndex, ":root"),
    built: collectTokens(builtCss, ":root"),
  },
  dark: {
    source: collectTokens(sourceIndex, ".dark"),
    built: collectTokens(builtCss, ".dark"),
  },
};

for (const theme of ["light", "dark"]) {
  const { source, built } = palettes[theme];
  // The source declaration and the shipped one must agree; a token that only
  // exists in one of them is the exact failure this gate was written for.
  for (const [name, expected] of Object.entries(EXPECTED[theme])) {
    check(source[name] === expected,
      `index.html ${theme} ${name} is "${source[name] ?? "(missing)"}", expected "${expected}"`);
    check(built[name] === expected,
      `built CSS ${theme} ${name} is "${built[name] ?? "(missing)"}", expected "${expected}"`);
  }

  for (const [name, expectedHex] of Object.entries(EXPECTED_STATUS[theme])) {
    const shipped = built[name];
    check(shipped !== undefined, `built CSS ${theme} is missing ${name}`);
    if (shipped === undefined) continue;
    const actualHex = rgbToHex(hslToRgb(shipped));
    check(actualHex === expectedHex,
      `built CSS ${theme} ${name} resolves to ${actualHex}, expected v3 fixed ${expectedHex}`);
  }

  const [min, max] = PRIMARY_L_BAND[theme];
  const lightness = lightnessOf(built["--primary"] ?? "0 0% 0%");
  check(lightness >= min && lightness <= max,
    `${theme} --primary lightness ${lightness}% is outside the ${min}-${max}% band`);

  const primaryRgb = hslToRgb(built["--primary"]);
  const surfaces = { ...REFERENCE_SURFACES[theme] };
  const ownSurfaces = { "--card": built["--card"], "--background": built["--background"] };
  for (const [name, value] of Object.entries(ownSurfaces)) {
    if (value) surfaces[name] = value;
  }
  for (const [name, value] of Object.entries(surfaces)) {
    const rgb = value.startsWith("#") ? hexToRgb(value) : hslToRgb(value);
    const ratio = contrast(primaryRgb, rgb);
    check(ratio >= AA_BODY,
      `${theme} --primary on ${name} is ${ratio.toFixed(2)}:1, need ${AA_BODY}:1`);
  }

  // The tint row. A palette can pass every solid surface and still fail here,
  // which is where the 30% -> 28% accent-foreground decision came from.
  const tintRatio = contrast(hslToRgb(built["--accent-foreground"]), hslToRgb(built["--accent"]));
  check(tintRatio >= AA_BODY,
    `${theme} --accent-foreground on --accent tint is ${tintRatio.toFixed(2)}:1, need ${AA_BODY}:1`);
}

const strippedCss = stripComments(builtCss);
for (const [, name] of strippedCss.matchAll(/(--[\w-]+)\s*:/g)) {
  check(!BANNED_PROPERTY.test(name), `Built CSS still declares the local alias ${name}`);
}
const bannedClass = strippedCss.match(BANNED_CLASS);
check(!bannedClass, `Built CSS still emits the local alias utility ${bannedClass?.[0]}`);

if (failures.length > 0) {
  for (const failure of [...new Set(failures)]) console.error(`  - ${failure}`);
  throw new Error(`Accent token gate failed with ${new Set(failures).size} problem(s)`);
}

const checks = Object.keys(EXPECTED.light).length * 4 + Object.keys(EXPECTED_STATUS.light).length * 2 + 12;
console.log(`Accent tokens: teal group palette verified (${checks} assertions, light + dark, contrast computed).`);
