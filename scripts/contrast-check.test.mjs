import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { contrast, parseColor, composite, checkPair, pairsFromCss } from './contrast-check.mjs';

const script = join(dirname(fileURLToPath(import.meta.url)), 'contrast-check.mjs');
const run = (...a) => spawnSync(process.execPath, [script, ...a], { encoding: 'utf8' });
const near = (a, b, eps = 0.01) => assert.ok(Math.abs(a - b) < eps, `${a} vs ${b}`);

test('black on white is 21:1', () => near(contrast('#000', '#fff'), 21));
test('same colour is 1:1', () => near(contrast('#777', '#777'), 1));
test('order of arguments does not change the ratio', () => near(contrast('#123456', '#fedcba'), contrast('#fedcba', '#123456')));
test('#777 on white is about 4.48 and fails AA normal', () => {
  const r = checkPair({ fg: '#777777', bg: '#ffffff' });
  near(r.ratio, 4.48);
  assert.equal(r.aa, false);
});
test('#767676 on white just passes AA normal', () => {
  const r = checkPair({ fg: '#767676', bg: '#ffffff' });
  assert.ok(r.ratio >= 4.5);
  assert.equal(r.aa, true);
});
test('#999 on white fails normal but passes nothing for large either', () => {
  const r = checkPair({ fg: '#999999', bg: '#fff', large: true });
  near(r.ratio, 2.85);
  assert.equal(r.aa, false);
});
test('large text threshold is 3:1', () => {
  assert.equal(checkPair({ fg: '#888888', bg: '#fff' }).aa, false);
  assert.equal(checkPair({ fg: '#888888', bg: '#fff', large: true }).aa, true);
});
test('AAA needs 7:1 normal and 4.5:1 large', () => {
  const r = checkPair({ fg: '#666666', bg: '#fff' });
  assert.equal(r.grade.normal.AAA, false);
  assert.equal(r.grade.large.AAA, true);
});
test('parseColor handles 3, 6 and 8 digit hex', () => {
  assert.deepEqual(parseColor('#fa0'), { r: 255, g: 170, b: 0, a: 1 });
  assert.deepEqual(parseColor('#0a0b0c'), { r: 10, g: 11, b: 12, a: 1 });
  near(parseColor('#00000080').a, 0.5, 0.005);
});
test('parseColor handles rgb() and hsl()', () => {
  assert.deepEqual(parseColor('rgb(255, 0, 0)'), { r: 255, g: 0, b: 0, a: 1 });
  const h = parseColor('hsl(120 100% 25%)');
  assert.equal(Math.round(h.g), 128);
  assert.equal(Math.round(h.r), 0);
  near(parseColor('rgba(0,0,0,0.5)').a, 0.5);
});
test('alpha foreground is composited over the background', () => {
  const c = composite('#00000080', '#ffffff');
  assert.ok(Math.abs(c.r - 127.5) < 1);
  near(contrast('#00000080', '#ffffff'), contrast('#7f7f7f', '#ffffff'), 0.01);
});
test('invalid colour throws', () => {
  assert.throws(() => parseColor('#12'), /invalid colour/);
  assert.throws(() => parseColor('banana'), /invalid colour/);
  assert.throws(() => parseColor('rgb(1,2)'), /invalid colour/);
});
test('CLI exits 0 on pass, 1 on fail, 2 on invalid colour', () => {
  assert.equal(run('#000', '#fff').status, 0);
  assert.equal(run('#999', '#fff').status, 1);
  const bad = run('nope', '#fff');
  assert.equal(bad.status, 2);
  assert.match(bad.stderr, /invalid colour/);
});
test('CLI --large changes the verdict', () => {
  assert.equal(run('#888', '#fff').status, 1);
  assert.equal(run('#888', '#fff', '--large').status, 0);
});
test('CLI prints the ratio', () => {
  assert.match(run('#000', '#fff').stdout, /21\.00:1/);
});
test('--tokens JSON: fails when one pair fails', () => {
  const dir = mkdtempSync(join(tmpdir(), 'cc-'));
  const f = join(dir, 't.json');
  writeFileSync(f, JSON.stringify({ pairs: [{ name: 'body', fg: '#111', bg: '#fff' }, { name: 'hint', fg: '#aaa', bg: '#fff' }] }));
  const r = run('--tokens', f);
  assert.equal(r.status, 1);
  assert.match(r.stdout, /1\/2 pairs pass AA/);
});
test('--tokens CSS resolves var() and checks each theme block', () => {
  const css = `:root{--text:#111;--surface:#fff;--muted:var(--text)}
  :root[data-theme="dark"]{--text:#eee;--surface:#111;--muted:#444}`;
  const pairs = pairsFromCss(css, 'text:surface,muted:surface');
  assert.equal(pairs.length, 4);
  const darkMuted = pairs.find((p) => p.name.includes('dark') && p.name.includes('muted'));
  assert.equal(checkPair(darkMuted).aa, false);
  const f = join(mkdtempSync(join(tmpdir(), 'cc-')), 't.css');
  writeFileSync(f, css);
  assert.equal(run('--tokens', f, '--pairs', 'text:surface,muted:surface').status, 1);
  assert.equal(run('--tokens', f).status, 2);
});
