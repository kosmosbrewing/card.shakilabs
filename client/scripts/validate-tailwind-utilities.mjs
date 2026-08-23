// Tailwind drops a utility it cannot resolve without a warning or a build
// failure. Two kinds die the same silent way:
//
//   1) A slash opacity outside the `opacity` scale. Tailwind 3.4.19 ships
//      0, 5, 10, 15 ... 95, 100 (steps of five), so 8, 12, 14 and 92 emit
//      nothing at all. Never judge this from memory: the built CSS is the
//      only evidence.
//   2) A colour or size name the theme never defined, usually copied in from
//      a sibling app whose tailwind.config.ts had it.
//
// Either way the class stays in the markup and only the CSS rule is missing,
// so the colour simply is not painted. A screen with a missing background
// reads as a deliberate design choice, which is why this survives review.
// This app shipped its site header that way on every prerendered page.
//
// Deliberately no name allowlist: the single criterion is "did a rule get
// emitted", so the scale or the theme can change without anyone editing a
// list here.
//
// NOTE: keep this file ASCII-only. scripts/font-subset-config.mjs feeds every
// character of client/scripts into the font subset, so a non-ASCII comment
// here would silently change the subset hash and fail the font gate.
import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function collectSourceFiles(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = resolve(dir, entry.name);
    if (entry.isDirectory()) collectSourceFiles(full, out);
    else if (/\.(vue|ts)$/.test(entry.name) && !/\.test\.ts$/.test(entry.name)) out.push(full);
  }
  return out;
}

const COLOR_PREFIX = "bg|text|border|ring|divide|fill|stroke|outline|placeholder|caret|accent|decoration";
// Token boundary. The prefix must not match mid-token: the animation utility
// `slide-in-from-top-4` carries a gradient-looking tail that is not a utility
// of its own, and flagging it would train people to ignore this gate.
// `!` (important) counts as a boundary and is kept in the token, because
// Tailwind emits `.\!text-profit` -- looking it up without the `!` would
// report a perfectly live class as dead.
const BOUNDARY = "(?<![a-zA-Z0-9-])";
const IMPORTANT = "!?";
// With a slash modifier, gradient stops included: their tail is a real colour.
const WITH_OPACITY = new RegExp(
  `${BOUNDARY}${IMPORTANT}(?:[a-z-]+:)*(?:${COLOR_PREFIX}|from|via|to)-[a-z][a-zA-Z0-9-]*\\/(?:\\d+|\\[[0-9.]+%?\\])`,
  "g"
);
// Without one, to catch names the theme never defined. Layout and typography
// utilities are not filtered out by name: they resolve to real rules, so the
// CSS lookup clears them on its own (which is how an off-scale `text-h2`
// gets caught too).
const PLAIN = new RegExp(
  `${BOUNDARY}${IMPORTANT}(?:[a-z-]+:)*(?:${COLOR_PREFIX})-[a-z][a-zA-Z0-9-]*(?=["'\\s\`]|$)`,
  "g"
);

// The characters Tailwind escapes when it turns a class name into a selector.
const toSelector = (cls) => cls.replace(/[/[\]%.:!]/g, (ch) => `\\${ch}`);

export function validateUtilitiesAreGenerated({ projectRoot, distRoot }) {
  const cssDir = resolve(distRoot, "assets");
  const cssFiles = readdirSync(cssDir).filter((name) => name.endsWith(".css"));
  assert(cssFiles.length > 0, "No built CSS found to validate utilities against");
  // Per-view CSS is code-split into separate files, so reading only one of
  // them would report live rules as missing.
  const css = cssFiles.map((name) => readFileSync(resolve(cssDir, name), "utf8")).join("\n");

  const files = collectSourceFiles(resolve(projectRoot, "src"));
  assert(files.length > 0, "No source files collected - utility extraction failed");

  const missing = [];
  let checked = 0;
  for (const file of files) {
    const source = readFileSync(file, "utf8");
    const found = new Set([...(source.match(WITH_OPACITY) ?? []), ...(source.match(PLAIN) ?? [])]);
    for (const cls of found) {
      checked += 1;
      const selector = toSelector(cls);
      if (css.includes(`.${selector}`)) continue;
      // A variant-prefixed class keeps the base name in the selector, so match
      // the tail rather than anchoring on the leading dot.
      if (new RegExp(`[.\\\\:]${selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}[\\s,:{>~+\\[]`).test(css)) continue;
      missing.push(`${cls}  (${file.slice(projectRoot.length + 1)})`);
    }
  }

  assert(missing.length === 0,
    "These utilities were written in the templates but produced no CSS rule. "
      + "Off-scale slash opacity needs the arbitrary-value syntax (/[8%]); a colour "
      + "or size name must exist in tailwind.config.ts:\n  "
      + missing.join("\n  "));
  assert(checked > 20,
    `Utility extraction found only ${checked} classes - the scanner is broken`);
  return checked;
}
