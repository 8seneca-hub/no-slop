#!/usr/bin/env node
// Zero-dependency linter for AI-slop phrases and patterns. Reads files, prints findings, writes nothing, uses no network.
import { readFileSync, readdirSync, statSync, existsSync, realpathSync } from 'node:fs';
import { join, resolve, relative, dirname, extname, basename, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const TIER_RANK = { H: 3, P: 2, Q: 1 };
const SCOPES = ['prose', 'copy', 'ui', 'code-comment'];
const CODE_EXT = new Set(['.js', '.mjs', '.cjs', '.ts', '.tsx', '.jsx', '.py', '.rb', '.go', '.rs', '.java', '.kt', '.swift', '.c', '.h', '.cpp', '.cs', '.php', '.sh', '.css', '.scss', '.vue', '.svelte']);
const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', 'build', '.next', 'coverage', '.expo']);
const SKIP_FILES = new Set(['package.json', 'package-lock.json', 'tsconfig.json', '.no-slop.json']);
const USAGE = `Usage: node scripts/slop-lint.mjs [--lang en] [--scope prose|copy|ui|code-comment] [--json] [--fail-on H|P|Q] [--rules <dir>] <files or directories>`;

class UsageError extends Error {}

// ---------- arguments ----------
export function parseArgs(argv) {
  const o = { scope: null, json: false, failOn: null, rules: null, paths: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const val = () => {
      if (i + 1 >= argv.length) throw new UsageError(`Missing value for ${a}`);
      return argv[++i];
    };
    if (a === '--json') o.json = true;
    else if (a === '--lang') { if (val() !== 'en') throw new UsageError('--lang accepts only en (English only; the option is ignored)'); }
    else if (a === '--scope') o.scope = val();
    else if (a === '--fail-on') o.failOn = val();
    else if (a === '--rules') o.rules = val();
    else if (a === '-h' || a === '--help') o.help = true;
    else if (a.startsWith('--')) throw new UsageError(`Unknown option ${a}`);
    else o.paths.push(a);
  }
  if (o.scope && !SCOPES.includes(o.scope)) throw new UsageError(`--scope must be one of ${SCOPES.join(', ')}`);
  if (o.failOn && !TIER_RANK[o.failOn]) throw new UsageError(`--fail-on must be H, P or Q`);
  if (!o.help && o.paths.length === 0) throw new UsageError('No files or directories given');
  return o;
}

// ---------- rules ----------
export function loadRules(dir) {
  if (!existsSync(dir) || !statSync(dir).isDirectory()) throw new UsageError(`Rules directory not found: ${dir}`);
  const files = readdirSync(dir).filter((f) => f.endsWith('.json')).sort();
  if (files.length === 0) throw new UsageError(`No rule files in ${dir}`);
  const rules = [];
  for (const f of files) {
    let data;
    try { data = JSON.parse(readFileSync(join(dir, f), 'utf8')); }
    catch (e) { throw new UsageError(`Bad JSON in ${join(dir, f)}: ${e.message}`); }
    if (!data || !Array.isArray(data.rules)) throw new UsageError(`${join(dir, f)}: missing "rules" array`);
    for (const r of data.rules) rules.push(compileRule(r, f));
  }
  return rules;
}

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const WORD = '[\\p{L}\\p{N}\\p{M}_]';

function compileRule(r, file) {
  if (!r || typeof r.id !== 'string' || typeof r.pattern !== 'string') throw new UsageError(`${file}: rule needs id and pattern`);
  if (!TIER_RANK[r.tier]) throw new UsageError(`${file}: ${r.id} has bad tier "${r.tier}"`);
  if (r.kind !== 'phrase' && r.kind !== 'regex') throw new UsageError(`${file}: ${r.id} has bad kind "${r.kind}"`);
  let re;
  try {
    if (r.kind === 'phrase') {
      const body = esc(r.pattern.normalize('NFC').trim()).replace(/['’]/g, "['’]").replace(/\s+/g, '\\s+');
      re = new RegExp(`(?<!${WORD})${body}(?!${WORD})`, 'giu');
    } else {
      const flags = [...new Set((r.flags || '').replace(/[gy]/g, '') + 'g')].join('');
      re = new RegExp(r.pattern, flags);
    }
  } catch (e) { throw new UsageError(`${file}: ${r.id} has an invalid pattern: ${e.message}`); }
  return { id: r.id, tier: r.tier, lang: r.lang || 'any', kind: r.kind, message: r.message || '', fix: r.fix || '', scope: Array.isArray(r.scope) ? r.scope : [], re };
}

// ---------- config ----------
export function findConfig(startDir) {
  let dir = resolve(startDir);
  for (;;) {
    const p = join(dir, '.no-slop.json');
    if (existsSync(p)) {
      try { return { root: dir, ...JSON.parse(readFileSync(p, 'utf8')) }; }
      catch (e) { throw new UsageError(`Bad JSON in ${p}: ${e.message}`); }
    }
    const up = dirname(dir);
    if (up === dir) return { root: resolve(startDir) };
    dir = up;
  }
}

function globToRe(g) {
  let s = '';
  for (let i = 0; i < g.length; i++) {
    const c = g[i];
    if (c === '*') {
      if (g[i + 1] === '*') { s += '.*'; i++; if (g[i + 1] === '/') i++; } else s += '[^/]*';
    } else if (c === '?') s += '[^/]';
    else s += c.replace(/[.+^${}()|[\]\\]/g, '\\$&');
  }
  return new RegExp(`^${s}$`);
}

const idMatches = (spec, id) => {
  if (spec.endsWith('*')) return id.startsWith(spec.slice(0, -1));
  return id === spec || id.startsWith(spec + '.');
};

// ---------- text preparation ----------
const blank = (s) => s.replace(/[^\n]/g, ' ');

export function maskMarkdown(text) {
  const lines = text.split('\n');
  let fence = null;
  let start = 0;
  if (lines[0] && /^---\s*$/.test(lines[0])) {
    const end = lines.findIndex((l, i) => i > 0 && /^---\s*$/.test(l));
    if (end > 0) { for (let i = 0; i <= end; i++) lines[i] = blank(lines[i]); start = end + 1; }
  }
  for (let i = start; i < lines.length; i++) {
    const l = lines[i];
    const m = l.match(/^\s{0,3}(`{3,}|~{3,})/);
    if (fence) {
      if (m && m[1][0] === fence[0] && m[1].length >= fence.length && l.trim() === m[1]) fence = null;
      lines[i] = blank(l);
    } else if (m) {
      fence = m[1];
      lines[i] = blank(l);
    } else {
      lines[i] = l.replace(/(`+)(?:(?!\1)[^\n])+?\1/g, (x) => ' '.repeat(x.length));
    }
  }
  return lines.join('\n');
}

export function maskComments(text) {
  const out = [];
  let inBlock = false;
  for (const line of text.split('\n')) {
    let res = '';
    let i = 0;
    while (i < line.length) {
      if (inBlock) {
        const e = line.indexOf('*/', i);
        if (e === -1) { res += line.slice(i); i = line.length; } else { res += line.slice(i, e) + '  '; i = e + 2; inBlock = false; }
      } else {
        const rest = line.slice(i);
        const b = rest.search(/\/\*/);
        const s = rest.search(/(^|[^:"'\w])\/\//);
        const h = rest.search(/(^|\s)#(?!\{|!|\[)/);
        const cands = [[b, 'b'], [s, 's'], [h, 'h']].filter(([p]) => p >= 0).sort((a, c) => a[0] - c[0]);
        if (cands.length === 0) { res += ' '.repeat(rest.length); i = line.length; break; }
        const [p, kind] = cands[0];
        if (kind === 'b') { res += ' '.repeat(p + 2); i += p + 2; inBlock = true; }
        else {
          const at = kind === 's' ? rest.indexOf('//', p) : rest.indexOf('#', p);
          res += ' '.repeat(at + (kind === 's' ? 2 : 1)) + rest.slice(at + (kind === 's' ? 2 : 1));
          i = line.length;
        }
      }
    }
    out.push(res);
  }
  return out.join('\n');
}

// Blank {placeholders} and ICU syntax while keeping the human words inside plural/select branches.
export function maskPlaceholders(s) {
  const chars = s.split('');
  const blankRange = (a, b) => { for (let k = a; k < b; k++) if (chars[k] !== '\n') chars[k] = ' '; };
  const stack = [];
  let i = 0;
  while (i < s.length) {
    const c = s[i];
    if (c === '{' && s[i + 1] === '{') {
      const e = s.indexOf('}}', i);
      if (e !== -1) { blankRange(i, e + 2); i = e + 2; continue; }
    }
    if (c === '{') {
      const top = stack[stack.length - 1];
      if (top === 'complex') {
        // selector branch: "one {" is syntax, the text inside is real
        stack.push('branch');
        blankRange(i, i + 1);
        i++;
        continue;
      }
      const m = s.slice(i).match(/^\{\s*[A-Za-z_][\w.]*\s*(,\s*(plural|select|selectordinal)\s*,)?/);
      if (m && m[2]) { blankRange(i, i + m[0].length); stack.push('complex'); i += m[0].length; continue; }
      const e = s.indexOf('}', i);
      if (e !== -1 && !s.slice(i + 1, e).includes('{')) { blankRange(i, e + 1); i = e + 1; continue; }
      blankRange(i, i + 1);
      i++;
      continue;
    }
    if (c === '}') {
      if (stack.length) { stack.pop(); blankRange(i, i + 1); }
      i++;
      continue;
    }
    const top = stack[stack.length - 1];
    if (top === 'complex') {
      // selectors like "=0", "one", "other" sit between branches
      const m = s.slice(i).match(/^\s*(=?[\w]+)\s*(?=\{)/);
      if (m) { blankRange(i, i + m[0].length); i += m[0].length; continue; }
    }
    if (top === 'branch' && c === '#') chars[i] = ' ';
    i++;
  }
  return chars.join('').replace(/<\/?[A-Za-z][^<>]*>/g, (x) => ' '.repeat(x.length)).replace(/%(?:\d+\$)?[sd]/g, (x) => ' '.repeat(x.length));
}

function lineIndex(text) {
  const starts = [0];
  for (let i = 0; i < text.length; i++) if (text[i] === '\n') starts.push(i + 1);
  return (off) => {
    let lo = 0, hi = starts.length - 1;
    while (lo < hi) { const mid = (lo + hi + 1) >> 1; if (starts[mid] <= off) lo = mid; else hi = mid - 1; }
    return { line: lo + 1, column: off - starts[lo] + 1 };
  };
}

function ignoresFor(rawText) {
  const per = new Map();
  const lines = rawText.split('\n');
  lines.forEach((l, idx) => {
    const m = l.match(/no-slop-ignore\s+((?:NS-[A-Za-z]+(?:-[\w.*]+)?[\s,]*)+)/);
    if (!m) return;
    const ids = m[1].split(/[\s,]+/).filter(Boolean);
    const own = l.slice(0, m.index).replace(/[\s<!\-\/#*{[]+/g, '') === '';
    for (const n of own ? [idx + 1, idx + 2] : [idx + 1]) per.set(n, [...(per.get(n) || []), ...ids]);
  });
  return per;
}

// ---------- matching ----------
function applicable(rules, o, scope) {
  return rules.filter((r) => r.scope.includes(scope) && !o.disabled.some((d) => idMatches(d, r.id)));
}

function matchText(rules, masked) {
  const hits = [];
  for (const r of rules) {
    r.re.lastIndex = 0;
    let m;
    while ((m = r.re.exec(masked)) !== null) {
      if (m[0] === '') { r.re.lastIndex++; continue; }
      hits.push({ rule: r, index: m.index, match: m[0] });
    }
  }
  return hits;
}

function finding(file, r, line, column, match, extra = {}) {
  return { file, line, column, id: r.id, rule: r.id.split('.')[0], tier: r.tier, message: r.message, fix: r.fix, match, ...extra };
}

function walkJson(node, path, visit) {
  if (typeof node === 'string') visit(path, node);
  else if (Array.isArray(node)) node.forEach((v, i) => walkJson(v, `${path}[${i}]`, visit));
  else if (node && typeof node === 'object') {
    for (const [k, v] of Object.entries(node)) {
      if (k.startsWith('$')) continue;
      walkJson(v, path ? `${path}.${k}` : k, visit);
    }
  }
}

export function lintFile(file, rawText, rules, o, displayName = file) {
  const text = rawText.normalize('NFC');
  const ext = extname(file).toLowerCase();
  const found = [];
  const ign = ignoresFor(text);
  const keep = (f) => !(ign.get(f.line) || []).some((spec) => idMatches(spec, f.id));

  if (ext === '.json') {
    let data;
    try { data = JSON.parse(text); } catch (e) { throw new UsageError(`${displayName}: invalid JSON (${e.message})`); }
    const scope = o.scope || 'copy';
    const rs = applicable(rules, o, scope);
    const at = lineIndex(text);
    let cursor = 0;
    walkJson(data, '', (path, value) => {
      const lastKey = path.replace(/\[\d+\]$/, '').split('.').pop().replace(/\[\d+\]/g, '');
      let pos = lastKey ? text.indexOf(JSON.stringify(lastKey), cursor) : -1;
      if (pos === -1) pos = cursor;
      const vpos = text.indexOf(JSON.stringify(value).slice(0, Math.min(8, JSON.stringify(value).length)), pos);
      if (vpos !== -1) cursor = vpos;
      const base = at(vpos === -1 ? pos : vpos);
      for (const h of matchText(rs, maskPlaceholders(value))) {
        found.push(finding(displayName, h.rule, base.line, base.column + 1 + h.index, h.match, { path }));
      }
    });
  } else {
    const isProse = ext === '.md' || ext === '.markdown' || ext === '.txt';
    const scope = o.scope || (isProse ? 'prose' : CODE_EXT.has(ext) ? 'code-comment' : 'prose');
    let masked = text;
    if (ext === '.md' || ext === '.markdown') masked = maskMarkdown(text);
    else if (scope === 'code-comment' && !isProse) masked = maskComments(text);
    const at = lineIndex(text);
    for (const h of matchText(applicable(rules, o, scope), masked)) {
      const p = at(h.index);
      found.push(finding(displayName, h.rule, p.line, p.column, h.match.split('\n')[0]));
    }
  }
  return found.filter(keep).sort((a, b) => a.line - b.line || a.column - b.column || a.id.localeCompare(b.id));
}

// ---------- file collection ----------
function collect(p, o, out) {
  const st = statSync(p);
  if (st.isFile()) { out.push(p); return; }
  for (const name of readdirSync(p).sort()) {
    const full = join(p, name);
    const s = statSync(full);
    if (s.isDirectory()) { if (!SKIP_DIRS.has(name)) collect(full, o, out); continue; }
    if (SKIP_FILES.has(name)) continue;
    const ext = extname(name).toLowerCase();
    const textual = ['.md', '.markdown', '.txt', '.json'].includes(ext);
    const code = o.scope === 'code-comment' && CODE_EXT.has(ext);
    if (textual || code) out.push(full);
  }
}

export function run(argv, cwd = process.cwd()) {
  const o = parseArgs(argv);
  if (o.help) return { code: 0, stdout: USAGE + '\n' };
  const here = dirname(fileURLToPath(import.meta.url));
  const rules = loadRules(resolve(cwd, o.rules || join(here, 'rules')));
  const cfg = findConfig(cwd);
  o.disabled = Array.isArray(cfg.disable) ? cfg.disable : [];
  const failOn = o.failOn || (TIER_RANK[cfg.failOn] ? cfg.failOn : 'H');
  const ignoreRes = (Array.isArray(cfg.ignore) ? cfg.ignore : []).map(globToRe);

  const files = [];
  for (const p of o.paths) {
    const full = resolve(cwd, p);
    if (!existsSync(full)) throw new UsageError(`Path not found: ${p}`);
    collect(full, o, files);
  }
  const all = [];
  for (const f of files) {
    const rel = relative(cfg.root, f).split(sep).join('/');
    if (ignoreRes.some((re) => re.test(rel))) continue;
    const shown = relative(cwd, f).split(sep).join('/') || basename(f);
    all.push(...lintFile(f, readFileSync(f, 'utf8'), rules, o, shown));
  }
  const failing = all.some((x) => TIER_RANK[x.tier] >= TIER_RANK[failOn]);
  let stdout;
  if (o.json) stdout = JSON.stringify(all, null, 2) + '\n';
  else {
    const lines = all.map((x) => `${x.file}:${x.line}:${x.column} ${x.id} ${x.tier} ${x.path ? `[${x.path}] ` : ''}${x.message}`);
    const n = (t) => all.filter((x) => x.tier === t).length;
    const byRule = new Map();
    for (const x of all) byRule.set(x.rule, (byRule.get(x.rule) || 0) + 1);
    if (byRule.size) lines.push('By rule: ' + [...byRule].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([k, v]) => `${k} x${v}`).join(', '));
    lines.push(`${all.length} finding${all.length === 1 ? '' : 's'} (H ${n('H')}, P ${n('P')}, Q ${n('Q')}) in ${files.length} file${files.length === 1 ? '' : 's'}`);
    stdout = lines.join('\n') + '\n';
  }
  return { code: failing ? 1 : 0, stdout };
}

const invoked = process.argv[1] && (() => { try { return realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url)); } catch { return false; } })();
if (invoked) {
  try {
    const r = run(process.argv.slice(2));
    process.stdout.write(r.stdout);
    process.exitCode = r.code;
  } catch (e) {
    if (e instanceof UsageError) { process.stderr.write(`slop-lint: ${e.message}\n${USAGE}\n`); process.exitCode = 2; }
    else throw e;
  }
}
