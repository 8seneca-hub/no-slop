#!/usr/bin/env node
// Runs slop-lint over evals/bad and evals/good and compares with evals/expected.json.
// Exit 1 on a missed rule in bad/, any finding in good/, or a fixture missing from expected.json.
import { readFileSync, readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const lint = join(here, '..', 'scripts', 'slop-lint.mjs');
const expected = JSON.parse(readFileSync(join(here, 'expected.json'), 'utf8'));

const files = ['bad', 'good'].flatMap((d) => readdirSync(join(here, d)).sort().map((f) => `${d}/${f}`));
const rows = [];
let failed = false;

for (const f of files) {
  const want = expected[f];
  const kind = f.startsWith('bad/') ? 'bad' : 'good';
  if (!want) { rows.push([f, 'FAIL', 'not listed in expected.json', '']); failed = true; continue; }
  const r = spawnSync(process.execPath, [lint, '--json', join(here, f)], { cwd: here, encoding: 'utf8' });
  if (r.status === 2) { rows.push([f, 'FAIL', `linter error: ${r.stderr.trim()}`, '']); failed = true; continue; }
  const found = JSON.parse(r.stdout);
  const have = new Set(found.flatMap((x) => [x.id, x.rule]));
  if (kind === 'bad') {
    const missed = want.filter((id) => !have.has(id));
    const ok = want.length > 0 && missed.length === 0;
    if (!ok) failed = true;
    rows.push([f, ok ? 'PASS' : 'FAIL', `expected ${want.join(' ')}`, missed.length ? `missed ${missed.join(' ')}` : `found ${found.length}`]);
  } else {
    const ok = found.length === 0;
    if (!ok) failed = true;
    rows.push([f, ok ? 'PASS' : 'FAIL', 'expected no findings', ok ? 'clean' : found.map((x) => `${x.id}@${x.line}`).join(' ')]);
  }
}
for (const f of Object.keys(expected)) if (!files.includes(f)) { rows.push([f, 'FAIL', 'listed in expected.json but file is missing', '']); failed = true; }

const w = [0, 1, 2, 3].map((i) => Math.max(...rows.map((r) => String(r[i]).length)));
for (const r of rows) console.log(r.map((c, i) => String(c).padEnd(w[i])).join('  ').trimEnd());
const pass = rows.filter((r) => r[1] === 'PASS').length;
console.log(`\n${pass}/${rows.length} fixtures as expected`);
process.exitCode = failed ? 1 : 0;
