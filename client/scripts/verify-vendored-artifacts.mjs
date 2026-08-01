#!/usr/bin/env node
// Cross-checks the vendored tgz against vendor/README.md and the package.json dependency ref.
//
// NOTE: comments in this file are intentionally ASCII-only. scripts/ is scanned by
// font-subset-config.mjs, so any non-ASCII character here would change the shipped
// font subset and force a fonts:subset regeneration.
//
// Why this matters: vendor/README.md records a SHA-256 used for integrity verification.
// Bumping the vendored version without updating the README leaves a *wrong supply-chain
// record* - 9 apps were still advertising the 0.3.7 hash after moving to 0.3.11.
// Reads files only - no network, no install, fully deterministic.
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const clientDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const vendorDir = resolve(clientDir, 'vendor');

if (!existsSync(vendorDir)) {
  console.log('[vendor] no client/vendor directory - skip');
  process.exit(0);
}

const tgzFiles = readdirSync(vendorDir).filter((f) => f.endsWith('.tgz'));
if (tgzFiles.length === 0) {
  console.log('[vendor] no vendored tgz - skip');
  process.exit(0);
}

const errors = [];
// Convention is to commit exactly one active artifact; extra rollback copies make it
// ambiguous which one the README is describing.
if (tgzFiles.length > 1) {
  errors.push(`expected exactly one vendored tgz, found ${tgzFiles.length}: ${tgzFiles.join(', ')}`);
}

const tgz = tgzFiles[0];
const sha256 = createHash('sha256').update(readFileSync(resolve(vendorDir, tgz))).digest('hex');
const version = tgz.replace(/^shakilabs-ui-/, '').replace(/\.tgz$/, '');

// 1) package.json must reference the exact file name that is committed.
const pkg = JSON.parse(readFileSync(resolve(clientDir, 'package.json'), 'utf8'));
const depRef = pkg.dependencies?.['@shakilabs/ui'];
const wantedRef = `file:vendor/${tgz}`;
if (depRef !== wantedRef) {
  errors.push(`package.json @shakilabs/ui: expected "${wantedRef}", got ${JSON.stringify(depRef)}`);
}

// 2) README must record the same file name, version and hash.
const readmePath = resolve(vendorDir, 'README.md');
if (!existsSync(readmePath)) {
  errors.push('client/vendor/README.md is missing');
} else {
  const readme = readFileSync(readmePath, 'utf8');
  if (!readme.includes(tgz)) errors.push(`README does not mention the vendored file name "${tgz}"`);
  // A leftover version string (e.g. 0.3.7 text after bumping to 0.3.11) hands the
  // reader the wrong answer, so treat it as a failure too.
  const staleVersions = [...new Set(readme.match(/\b\d+\.\d+\.\d+\b/g) ?? [])].filter((v) => v !== version);
  if (staleVersions.length > 0) {
    errors.push(`README mentions stale version(s) ${staleVersions.join(', ')} while the vendored artifact is ${version}`);
  }
  const documented = readme.match(/\b[0-9a-f]{64}\b/g) ?? [];
  if (documented.length === 0) {
    errors.push('README records no SHA-256 for the vendored artifact');
  } else if (!documented.includes(sha256)) {
    errors.push(`README SHA-256 mismatch: file is ${sha256}, README records ${documented.join(', ')}`);
  }
}

if (errors.length > 0) {
  console.error('[vendor] vendored artifact records are inconsistent:');
  for (const e of errors) console.error(`  - ${e}`);
  console.error('  fix: update client/vendor/README.md (file name, version, SHA-256) and package.json together.');
  process.exit(1);
}

console.log(`[vendor] ok - ${tgz} (${version}) sha256=${sha256}`);
