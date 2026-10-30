#!/usr/bin/env node
// WCAG 2.x contrast checker. Zero dependencies, Node 20+.
// Usage:
//   node contrast-check.mjs <fg> <bg> [--large]
//   node contrast-check.mjs --tokens <file.json|file.css> [--pairs "text:surface,muted:surface"]
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));

function num(s) {
  const v = Number(s);
  if (!Number.isFinite(v)) throw new Error(`invalid number "${s}"`);
  return v;
}

function channel(s) {
  s = s.trim();
  return s.endsWith('%') ? clamp((num(s.slice(0, -1)) / 100) * 255, 0, 255) : clamp(num(s), 0, 255);
}

function alphaOf(s) {
  if (s === undefined) return 1;
  s = s.trim();
  return clamp(s.endsWith('%') ? num(s.slice(0, -1)) / 100 : num(s), 0, 1);
}

function hslToRgb(h, s, l) {
  h = ((h % 360) + 360) % 360;
  s = clamp(s, 0, 100) / 100;
  l = clamp(l, 0, 100) / 100;
  const k = (n) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [f(0) * 255, f(8) * 255, f(4) * 255];
}

/** Parse #rgb, #rgba, #rrggbb, #rrggbbaa, rgb(), rgba(), hsl(), hsla(), white, black, transparent. */
export function parseColor(input) {
  if (typeof input !== 'string') throw new Error('colour must be a string');
  const s = input.trim().toLowerCase();
  if (s === 'white') return { r: 255, g: 255, b: 255, a: 1 };
  if (s === 'black') return { r: 0, g: 0, b: 0, a: 1 };
  if (s === 'transparent') return { r: 0, g: 0, b: 0, a: 0 };
  let m = /^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/.exec(s);
  if (m) {
    let h = m[1];
    if (h.length <= 4) h = [...h].map((c) => c + c).join('');
    return {
      r: parseInt(h.slice(0, 2), 16),
      g: parseInt(h.slice(2, 4), 16),
      b: parseInt(h.slice(4, 6), 16),
      a: h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1,
    };
  }
  m = /^(rgba?|hsla?)\(([^)]*)\)$/.exec(s);
  if (m) {
    const parts = m[2].split(/[\s,/]+/).filter(Boolean);
    if (parts.length < 3 || parts.length > 4) throw new Error(`invalid colour "${input}"`);
    try {
      if (m[1].startsWith('rgb')) {
        return { r: channel(parts[0]), g: channel(parts[1]), b: channel(parts[2]), a: alphaOf(parts[3]) };
      }
      const [r, g, b] = hslToRgb(num(parts[0].replace('deg', '')), num(parts[1].replace('%', '')), num(parts[2].replace('%', '')));
      return { r, g, b, a: alphaOf(parts[3]) };
    } catch {
      throw new Error(`invalid colour "${input}"`);
    }
  }
  throw new Error(`invalid colour "${input}"`);
}

const toColor = (c) => (typeof c === 'string' ? parseColor(c) : c);

/** Composite a translucent colour over an opaque backdrop. */
export function composite(fg, bg) {
  const f = toColor(fg);
  const b = toColor(bg);
  const a = f.a;
  return {
    r: f.r * a + b.r * (1 - a),
    g: f.g * a + b.g * (1 - a),
    b: f.b * a + b.b * (1 - a),
    a: 1,
  };
}

export function luminance(c) {
  const { r, g, b } = toColor(c);
  const lin = (v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

/** Contrast ratio between fg and bg (1 to 21). A translucent bg is composited over white; a translucent fg over bg. */
export function contrast(fg, bg) {
  let b = toColor(bg);
  if (b.a < 1) b = composite(b, { r: 255, g: 255, b: 255, a: 1 });
  const f = composite(fg, b);
  const l1 = luminance(f);
  const l2 = luminance(b);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

/** Pass flags for a ratio. Thresholds apply to the unrounded ratio. */
export function grade(ratio) {
  return {
    normal: { AA: ratio >= 4.5, AAA: ratio >= 7 },
    large: { AA: ratio >= 3, AAA: ratio >= 4.5 },
  };
}

const floor2 = (n) => (Math.floor(n * 100) / 100).toFixed(2);

export function checkPair({ name = '', fg, bg, large = false }) {
  const ratio = contrast(fg, bg);
  const g = grade(ratio);
  const kind = large ? g.large : g.normal;
  return { name, fg, bg, large, ratio, grade: g, aa: kind.AA, aaa: kind.AAA };
}

function formatResult(r) {
  const label = r.name ? `${r.name}  ` : '';
  const yn = (v) => (v ? 'pass' : 'FAIL');
  return (
    `${label}${r.fg} on ${r.bg}  ${floor2(r.ratio)}:1  ` +
    `normal AA ${yn(r.grade.normal.AA)} AAA ${yn(r.grade.normal.AAA)}  ` +
    `large AA ${yn(r.grade.large.AA)} AAA ${yn(r.grade.large.AAA)}` +
    (r.large ? '  [large rule applied]' : '') +
    (r.aa ? '' : '  <- fails AA')
  );
}

/** Parse CSS into { selector, vars } blocks. Comments are stripped. */
export function parseCssVars(css) {
  const clean = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const blocks = [];
  const re = /([^{}]+)\{([^{}]*)\}/g;
  let m;
  while ((m = re.exec(clean))) {
    const vars = {};
    for (const d of m[2].matchAll(/(--[\w-]+)\s*:\s*([^;]+);?/g)) vars[d[1]] = d[2].trim();
    if (Object.keys(vars).length) blocks.push({ selector: m[1].trim().replace(/\s+/g, ' '), vars });
  }
  return blocks;
}

function resolveVar(value, vars, depth = 0) {
  const m = /^var\(\s*(--[\w-]+)\s*(?:,\s*([^)]+))?\)$/.exec(value.trim());
  if (!m) return value.trim();
  if (depth > 8) throw new Error(`variable loop at ${m[1]}`);
  const next = vars[m[1]] ?? m[2];
  if (next === undefined) throw new Error(`undefined variable ${m[1]}`);
  return resolveVar(next, vars, depth + 1);
}

/** Build pairs from CSS custom properties. pairsSpec: "text:surface,muted:surface" (names with or without leading --). */
export function pairsFromCss(css, pairsSpec) {
  if (!pairsSpec) throw new Error('CSS token files need --pairs "fg:bg,..."');
  const blocks = parseCssVars(css);
  const base = {};
  const out = [];
  const specs = pairsSpec.split(',').map((p) => p.trim()).filter(Boolean).map((p) => {
    const [fg, bg, flag] = p.split(':').map((x) => x.trim());
    if (!fg || !bg) throw new Error(`bad pair "${p}", expected fg:bg`);
    const dash = (n) => (n.startsWith('--') ? n : `--${n}`);
    return { fg: dash(fg), bg: dash(bg), large: flag === 'large' };
  });
  for (const b of blocks) {
    const isBase = /(^|,)\s*(:root|html|body)\s*(,|$)/.test(b.selector) && !/\[|\.dark|\.light/.test(b.selector);
    const vars = { ...(isBase ? {} : base), ...b.vars };
    if (isBase) Object.assign(base, b.vars);
    for (const s of specs) {
      if (!(s.fg in b.vars) && !(s.bg in b.vars)) continue;
      if (!(s.fg in vars) || !(s.bg in vars)) continue;
      out.push({
        name: `${b.selector} ${s.fg}/${s.bg}`,
        fg: resolveVar(vars[s.fg], vars),
        bg: resolveVar(vars[s.bg], vars),
        large: s.large,
      });
    }
  }
  if (!out.length) throw new Error('no pairs resolved from the CSS file; check --pairs names');
  return out;
}

export function pairsFromFile(path, pairsSpec) {
  const text = readFileSync(path, 'utf8');
  if (path.endsWith('.json')) {
    const data = JSON.parse(text);
    if (!data || !Array.isArray(data.pairs)) throw new Error('JSON needs a "pairs" array');
    return data.pairs.map((p) => {
      if (!p.fg || !p.bg) throw new Error(`pair "${p.name ?? ''}" needs fg and bg`);
      return { name: p.name ?? '', fg: p.fg, bg: p.bg, large: Boolean(p.large || p.ui) };
    });
  }
  return pairsFromCss(text, pairsSpec);
}

const USAGE = `Usage:
  node contrast-check.mjs <fg> <bg> [--large]
  node contrast-check.mjs --tokens <file.json|file.css> [--pairs "text:surface,muted:surface"]
Colours: #rgb #rrggbb #rrggbbaa rgb() hsl(). Exit 0 all pairs pass AA, 1 any fails, 2 bad input.`;

export function main(argv, out = console.log) {
  try {
    const args = [...argv];
    if (!args.length || args.includes('--help') || args.includes('-h')) {
      out(USAGE);
      return args.length ? 0 : 2;
    }
    const take = (flag) => {
      const i = args.indexOf(flag);
      if (i < 0) return undefined;
      const v = args[i + 1];
      if (v === undefined) throw new Error(`${flag} needs a value`);
      args.splice(i, 2);
      return v;
    };
    const large = (() => {
      const i = args.indexOf('--large');
      if (i < 0) return false;
      args.splice(i, 1);
      return true;
    })();
    const tokens = take('--tokens');
    const pairsSpec = take('--pairs');
    let pairs;
    if (tokens) {
      pairs = pairsFromFile(tokens, pairsSpec);
    } else {
      if (args.length !== 2) throw new Error('expected <fg> <bg>');
      pairs = [{ fg: args[0], bg: args[1], large }];
    }
    let failed = 0;
    for (const p of pairs) {
      const r = checkPair(p);
      out(formatResult(r));
      if (!r.aa) failed++;
    }
    if (pairs.length > 1) out(`${pairs.length - failed}/${pairs.length} pairs pass AA`);
    return failed ? 1 : 0;
  } catch (e) {
    console.error(`error: ${e.message}`);
    return 2;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exitCode = main(process.argv.slice(2));
}
