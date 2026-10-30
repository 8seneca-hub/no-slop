import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { maskPlaceholders, maskMarkdown, maskComments } from './slop-lint.mjs';

const CLI = join(dirname(fileURLToPath(import.meta.url)), 'slop-lint.mjs');
const root = mkdtempSync(join(tmpdir(), 'slop-lint-'));
test.after(() => rmSync(root, { recursive: true, force: true }));

const rulesDir = join(root, 'rules');
mkdirSync(rulesDir);
const R = (id, tier, lang, kind, pattern, scope, flags = 'i') => ({ id, tier, lang, kind, pattern, flags, message: `msg ${id}`, fix: 'fix', scope });
writeFileSync(join(rulesDir, 'a.json'), JSON.stringify({
  version: 1,
  rules: [
    R('NS-T-01.01', 'P', 'en', 'phrase', "here's the thing", ['prose', 'copy']),
    R('NS-T-01.02', 'Q', 'en', 'phrase', 'delve', ['prose', 'copy']),
    R('NS-T-02.01', 'Q', 'any', 'regex', '—', ['prose', 'code-comment']),
    R('NS-T-02.02', 'H', 'any', 'regex', '—', ['copy', 'ui']),
    R('NS-T-03.01', 'H', 'en', 'phrase', 'oops', ['copy', 'ui']),
    R('NS-T-03.02', 'H', 'en', 'phrase', 'something went wrong', ['copy', 'ui']),
    R('NS-T-04.v01', 'Q', 'vi', 'phrase', 'đã xảy ra lỗi', ['copy', 'prose']),
    R('NS-T-04.v02', 'P', 'vi', 'phrase', 'ma', ['copy', 'prose']),
    R('NS-T-05.01', 'H', 'any', 'regex', '^\\s*(?:—|n/a)\\s*$', ['copy'], 'im'),
    R('NS-T-07.01', 'Q', 'en', 'phrase', 'it’s worth noting', ['prose']),
    R('NS-T-06.01', 'Q', 'en', 'phrase', 'added function to', ['code-comment']),
  ],
}));

function lint(args, files = {}, extra = {}) {
  const dir = mkdtempSync(join(root, 'w-'));
  for (const [name, body] of Object.entries(files)) {
    mkdirSync(dirname(join(dir, name)), { recursive: true });
    writeFileSync(join(dir, name), body);
  }
  const res = spawnSync(process.execPath, [CLI, '--rules', rulesDir, ...args], { cwd: dir, encoding: 'utf8', ...extra });
  let json = null;
  if (args.includes('--json') && res.status !== 2) json = JSON.parse(res.stdout);
  return { ...res, json, dir };
}
const ids = (r) => r.json.map((f) => f.id);

test('phrase matches case-insensitively', () => {
  assert.deepEqual(ids(lint(['--json', 'a.md'], { 'a.md': "HERE'S THE THING about it." })), ['NS-T-01.01']);
});
test('phrase respects word boundaries', () => {
  assert.deepEqual(ids(lint(['--json', 'a.md'], { 'a.md': 'The delver and delves stay.' })), []);
  assert.deepEqual(ids(lint(['--json', 'a.md'], { 'a.md': 'We delve, then stop.' })), ['NS-T-01.02']);
});
test('straight pattern apostrophe matches a curly apostrophe in text', () => {
  assert.equal(lint(['--json', 'a.md'], { 'a.md': 'Here’s the thing.' }).json.length, 1);
});
test('curly pattern apostrophe matches a straight apostrophe in text', () => {
  assert.deepEqual(ids(lint(['--json', 'a.md'], { 'a.md': "It's worth noting x." })), ['NS-T-07.01']);
});
test('phrase matches across a line wrap', () => {
  assert.equal(lint(['--json', 'a.md'], { 'a.md': "Here's\nthe thing." }).json.length, 1);
});
test('em dash flagged in prose as Q', () => {
  const r = lint(['--json', 'a.md'], { 'a.md': 'One — two.' });
  assert.deepEqual(r.json.map((f) => [f.id, f.tier]), [['NS-T-02.01', 'Q']]);
});
test('em dash flagged in a catalog as H', () => {
  const r = lint(['--json', 'en.json'], { 'en.json': '{"a":"Save — now"}' });
  assert.deepEqual(r.json.map((f) => [f.id, f.tier]), [['NS-T-02.02', 'H']]);
});
test('vietnamese phrase matches with diacritics', () => {
  assert.deepEqual(ids(lint(['--json', 'vi.json'], { 'vi.json': '{"e":"Đã xảy ra lỗi."}' })), ['NS-T-04.v01']);
});
test('vietnamese matching is diacritic exact', () => {
  assert.deepEqual(ids(lint(['--json', 'vi.json'], { 'vi.json': '{"e":"Da xay ra loi."}' })), []);
});
test('vietnamese word boundary: "ma" does not match inside "mạng" or "máy"', () => {
  assert.deepEqual(ids(lint(['--json', 'vi.json'], { 'vi.json': '{"e":"mạng máy tính"}' })), []);
  assert.deepEqual(ids(lint(['--json', 'vi.json'], { 'vi.json': '{"e":"đó là ma ở đây"}' })), ['NS-T-04.v02']);
});
test('decomposed (NFD) vietnamese text still matches', () => {
  const nfd = 'Đã xảy ra lỗi'.normalize('NFD');
  assert.equal(lint(['--json', 'vi.json'], { 'vi.json': JSON.stringify({ e: nfd }) }).json.length, 1);
});
test('--lang en skips vietnamese rules, keeps any-language rules', () => {
  const r = lint(['--lang', 'en', '--json', 'vi.json'], { 'vi.json': '{"e":"Đã xảy ra lỗi — x"}' });
  assert.deepEqual(ids(r), ['NS-T-02.02']);
});
test('--lang vi skips english rules', () => {
  const r = lint(['--lang', 'vi', '--json', 'en.json'], { 'en.json': '{"e":"Oops"}' });
  assert.deepEqual(ids(r), []);
});
test('catalog reports nested key paths', () => {
  const r = lint(['--json', 'en.json'], { 'en.json': '{"a":{"b":{"c":"Oops"}},"list":["fine","Oops again"]}' });
  assert.deepEqual(r.json.map((f) => f.path), ['a.b.c', 'list[1]']);
});
test('catalog keys are not linted, only values', () => {
  assert.deepEqual(ids(lint(['--json', 'en.json'], { 'en.json': '{"oops":"Fine","delve":"Fine"}' })), []);
});
test('catalog findings carry a line number', () => {
  const r = lint(['--json', 'en.json'], { 'en.json': '{\n  "a": "ok",\n  "b": "Oops"\n}\n' });
  assert.equal(r.json[0].line, 3);
});
test('simple placeholders are ignored', () => {
  assert.equal(maskPlaceholders('Hi {name}, {{count}} items %s').replace(/\s+/g, ' ').trim(), 'Hi , items');
  assert.deepEqual(ids(lint(['--json', 'en.json'], { 'en.json': '{"a":"Hello {oops}"}' })), []);
});
test('ICU plural syntax is kept intact and its branch text is still linted', () => {
  const icu = '{count, plural, one {# item} other {# items. Oops}}';
  const m = maskPlaceholders(icu);
  assert.equal(m.length, icu.length);
  assert.ok(!m.includes('plural') && !m.includes('{') && !m.includes('}'));
  assert.ok(m.includes('item') && m.includes('Oops'));
  assert.deepEqual(ids(lint(['--json', 'en.json'], { 'en.json': JSON.stringify({ a: icu }) })), ['NS-T-03.01']);
});
test('markdown fenced code is skipped', () => {
  const md = 'ok\n\n```\nHere\'s the thing\n```\n\nafter';
  assert.equal(maskMarkdown(md).includes('thing'), false);
  assert.equal(lint(['--json', 'a.md'], { 'a.md': md }).json.length, 0);
});
test('tilde fences and nested longer fences are skipped', () => {
  assert.equal(lint(['--json', 'a.md'], { 'a.md': '~~~\nOops — x\n~~~\n````\n```\nOops — y\n```\n````\n' }).json.length, 0);
});
test('markdown inline code is skipped', () => {
  assert.equal(lint(['--json', 'a.md'], { 'a.md': 'Use `here\'s the thing` as a literal and `a — b`.' }).json.length, 0);
});
test('text after a closed fence is linted again', () => {
  assert.equal(lint(['--json', 'a.md'], { 'a.md': '```\nx\n```\nWe delve.' }).json.length, 1);
});
test('markdown front matter is skipped', () => {
  assert.equal(lint(['--json', 'a.md'], { 'a.md': '---\ntitle: We delve\n---\nPlain.' }).json.length, 0);
});
test('inline ignore on the same line', () => {
  const r = lint(['--json', 'a.md'], { 'a.md': 'We delve. <!-- no-slop-ignore NS-T-01.02 -->\nWe delve again.' });
  assert.deepEqual(r.json.map((f) => f.line), [2]);
});
test('inline ignore on its own line covers the next line', () => {
  const r = lint(['--json', 'a.md'], { 'a.md': '<!-- no-slop-ignore NS-T-01 -->\nWe delve.\nWe delve.' });
  assert.deepEqual(r.json.map((f) => f.line), [3]);
});
test('code files are scanned in comments only with --scope code-comment', () => {
  const src = 'const s = "Added function to x";\n// Added function to retry\n/* We delve — here */\n';
  const r = lint(['--scope', 'code-comment', '--json', 'a.js'], { 'a.js': src });
  assert.deepEqual(r.json.map((f) => [f.line, f.id]), [[2, 'NS-T-06.01'], [3, 'NS-T-02.01']]);
});
test('maskComments leaves urls and strings alone', () => {
  assert.equal(maskComments('const u = "http://x.y"; // note').includes('http'), false);
});
test('config disable removes a rule, including by prefix', () => {
  const files = { 'a.md': 'We delve. Here\'s the thing.', '.no-slop.json': '{"disable":["NS-T-01.02"]}' };
  assert.deepEqual(ids(lint(['--json', 'a.md'], files)), ['NS-T-01.01']);
  assert.deepEqual(ids(lint(['--json', 'a.md'], { ...files, '.no-slop.json': '{"disable":["NS-T-01"]}' })), []);
});
test('config ignore globs skip files', () => {
  const r = lint(['--json', '.'], { 'docs/a.md': 'We delve.', 'keep/b.md': 'We delve.', '.no-slop.json': '{"ignore":["docs/**"]}' });
  assert.deepEqual(r.json.map((f) => f.file), ['keep/b.md']);
});
test('exit code is 0 when only Q findings exist and fail-on defaults to H', () => {
  assert.equal(lint(['a.md'], { 'a.md': 'We delve.' }).status, 0);
});
test('exit code is 1 when an H finding exists', () => {
  assert.equal(lint(['en.json'], { 'en.json': '{"a":"Oops"}' }).status, 1);
});
test('--fail-on P and Q raise the bar down', () => {
  const f = { 'a.md': "Here's the thing." };
  assert.equal(lint(['--fail-on', 'P', 'a.md'], f).status, 1);
  assert.equal(lint(['--fail-on', 'H', 'a.md'], f).status, 0);
  assert.equal(lint(['--fail-on', 'Q', 'a.md'], { 'a.md': 'We delve.' }).status, 1);
  assert.equal(lint(['--fail-on', 'P', 'a.md'], { 'a.md': 'We delve.' }).status, 0);
});
test('config failOn is used when the flag is absent; the flag wins', () => {
  const f = { 'a.md': 'We delve.', '.no-slop.json': '{"failOn":"Q"}' };
  assert.equal(lint(['a.md'], f).status, 1);
  assert.equal(lint(['--fail-on', 'H', 'a.md'], f).status, 0);
});
test('JSON output shape', () => {
  const r = lint(['--json', 'a.md'], { 'a.md': 'ok\nWe delve.' });
  assert.deepEqual(Object.keys(r.json[0]).sort(), ['column', 'file', 'fix', 'id', 'line', 'match', 'message', 'rule', 'tier']);
  assert.deepEqual([r.json[0].file, r.json[0].line, r.json[0].column, r.json[0].match], ['a.md', 2, 4, 'delve']);
});
test('JSON rule field is the parent id; disable and ignore accept parent or full id', () => {
  const r = lint(['--json', 'a.md'], { 'a.md': 'We delve.' });
  assert.equal(r.json[0].rule, 'NS-T-01');
  assert.equal(lint(['--json', 'a.md'], { 'a.md': 'We delve.', '.no-slop.json': '{"disable":["NS-T-01.02"]}' }).json.length, 0);
  assert.equal(lint(['--json', 'a.md'], { 'a.md': 'We delve. <!-- no-slop-ignore NS-T-01 -->' }).json.length, 0);
});
test('human summary groups by parent rule', () => {
  assert.match(lint(['a.md'], { 'a.md': "We delve. Here's the thing." }).stdout, /By rule: NS-T-01 x2/);
});
test('JSON output is an empty array when clean', () => {
  assert.deepEqual(lint(['--json', 'a.md'], { 'a.md': 'Clean text.' }).json, []);
});
test('human output line format', () => {
  const r = lint(['a.md'], { 'a.md': 'We delve.' });
  assert.match(r.stdout, /^a\.md:1:4 NS-T-01\.02 Q msg NS-T-01\.02$/m);
  assert.match(r.stdout, /1 finding \(H 0, P 0, Q 1\)/);
});
test('human output shows the key path for catalogs', () => {
  assert.match(lint(['en.json'], { 'en.json': '{"x":{"y":"Oops"}}' }).stdout, /en\.json:1:\d+ NS-T-03\.01 H \[x\.y\] msg/);
});
test('regex rule with the m flag matches a whole-value dash placeholder', () => {
  assert.deepEqual(ids(lint(['--json', 'en.json'], { 'en.json': '{"a":"—","b":"n/a","c":"Fine"}' })).sort(), ['NS-T-02.02', 'NS-T-05.01', 'NS-T-05.01']);
});
test('directories are walked; node_modules and package.json are skipped', () => {
  const r = lint(['--json', '.'], { 'x/a.md': 'We delve.', 'node_modules/b.md': 'We delve.', 'package.json': '{"name":"Oops"}' });
  assert.deepEqual(r.json.map((f) => f.file), ['x/a.md']);
});
test('exit 2 on an unknown option', () => {
  assert.equal(lint(['--bogus', 'a.md'], { 'a.md': 'x' }).status, 2);
});
test('exit 2 on a bad --fail-on or --lang value', () => {
  assert.equal(lint(['--fail-on', 'X', 'a.md'], { 'a.md': 'x' }).status, 2);
  assert.equal(lint(['--lang', 'fr', 'a.md'], { 'a.md': 'x' }).status, 2);
});
test('exit 2 when no path is given or the path is missing', () => {
  assert.equal(lint([], {}).status, 2);
  assert.equal(lint(['nope.md'], {}).status, 2);
});
test('exit 2 when the rules directory is missing or a rule is invalid', () => {
  const r = spawnSync(process.execPath, [CLI, '--rules', join(root, 'none'), 'x.md'], { encoding: 'utf8' });
  assert.equal(r.status, 2);
  const bad = mkdtempSync(join(root, 'bad-'));
  writeFileSync(join(bad, 'b.json'), JSON.stringify({ version: 1, rules: [R('NS-T-99.01', 'H', 'en', 'regex', '(', ['prose'])] }));
  assert.equal(spawnSync(process.execPath, [CLI, '--rules', bad, 'x.md'], { encoding: 'utf8', cwd: root }).status, 2);
});
test('exit 2 on invalid JSON input', () => {
  assert.equal(lint(['en.json'], { 'en.json': '{oops' }).status, 2);
});
test('the linter never writes files', () => {
  const r = lint(['a.md'], { 'a.md': 'We delve.' });
  assert.equal(r.stderr, '');
});
test('ships with default rules that load and run', () => {
  const dir = mkdtempSync(join(root, 'd-'));
  writeFileSync(join(dir, 'a.md'), "Here's the thing. Let's dive in.\n");
  const r = spawnSync(process.execPath, [CLI, '--json', 'a.md'], { cwd: dir, encoding: 'utf8' });
  assert.ok([0, 1].includes(r.status));
  assert.ok(JSON.parse(r.stdout).length >= 1);
});
