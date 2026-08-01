#!/usr/bin/env node
// Verifies only the *identity* of a committed SBOM.
//
// NOTE: comments in this file are intentionally ASCII-only. scripts/ is scanned by
// font-subset-config.mjs, so any non-ASCII character here would change the shipped
// font subset and force a fonts:subset regeneration.
//
// Why identity-only instead of regenerate-and-diff: CycloneDX metadata.timestamp,
// SPDX documentNamespace (random UUID) and the npm CLI version recorded in tools
// all change on every run, so `git diff --exit-code` would be permanently red.
// This check reads files only - no network, no npm ci, fully deterministic.
//
// Repositories that do not commit an SBOM exit 0 immediately, so this exact file
// can be copied to all 12 app repos and activates by itself once one starts
// committing SBOMs.
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const clientDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => JSON.parse(readFileSync(p, 'utf8'));
const pkg = read(resolve(clientDir, 'package.json'));
const cyclonedxPath = resolve(clientDir, 'artifacts/sbom/production.cyclonedx.json');
const spdxPath = resolve(clientDir, 'artifacts/sbom/production.spdx.json');

if (!existsSync(cyclonedxPath)) {
  console.log('[sbom-identity] no committed SBOM at client/artifacts/sbom - skip');
  process.exit(0);
}

const errors = [];
const expect = (label, actual, wanted) => {
  if (actual !== wanted) errors.push(`${label}: expected ${JSON.stringify(wanted)}, got ${JSON.stringify(actual)}`);
};

const component = read(cyclonedxPath)?.metadata?.component ?? {};
expect('cyclonedx metadata.component.name', component.name, pkg.name);
expect('cyclonedx metadata.component.version', component.version, pkg.version);

// GITHUB_REPOSITORY only exists on Actions; skip the vcs comparison when running locally.
if (process.env.GITHUB_REPOSITORY) {
  const vcs = (component.externalReferences ?? []).find((r) => r.type === 'vcs');
  expect('cyclonedx vcs url', vcs?.url, `https://github.com/${process.env.GITHUB_REPOSITORY}`);
}

if (existsSync(spdxPath)) {
  const spdx = read(spdxPath);
  const rootId = spdx.documentDescribes?.[0];
  const rootPkg = (spdx.packages ?? []).find((p) => p.SPDXID === rootId);
  expect('spdx root package name', rootPkg?.name, pkg.name);
}

if (errors.length > 0) {
  console.error('[sbom-identity] committed SBOM does not describe this repository:');
  for (const e of errors) console.error(`  - ${e}`);
  console.error("  fix: regenerate the SBOM in this repository instead of copying another app's artifacts.");
  process.exit(1);
}

console.log(`[sbom-identity] ok - ${pkg.name}@${pkg.version}`);
