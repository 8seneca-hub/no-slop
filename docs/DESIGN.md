# no-slop: design

A Claude Code and Codex plugin from 8seneca that stops generic AI output in prose, product copy, UI, mobile layout, accessibility and code comments. It filters; it does not set a style. Direction comes from the repo (`DESIGN.md`, the component kit, `CLAUDE.md`).

## Principles

1. **Router, not a wall.** One core skill of at most 120 lines is always loaded. It routes to the skill for the task. References load on demand.
2. **Mechanical checks are code.** `scripts/slop-lint.mjs` (zero dependencies, Node 20+) finds banned phrases, em dashes, filler, raw ids and dash placeholders in text and message catalogs, in English and Vietnamese. The model handles judgment: structure, voice, specificity, design.
3. **Voice first for people, consistency first for product.** Personal writing: minimal edit, keep the author's voice. Product copy and docs: strict and uniform.
4. **Headless by default.** The mode is never a question to an agent. Order: the user's explicit instruction, then the brief, then the repo's `.no-slop.json` or the `no-slop` block in `CLAUDE.md`, then the task type (edit or build = during; audit, review, "is this slop?" = after or detect). Ask only in an interactive chat when the task type is ambiguous.
5. **Repo wins.** Precedence: explicit user instruction, then the repo's `DESIGN.md`, kit and owner rules, then these skills. A conflict is named in the notes, never silently resolved.
6. **No invention.** Never create statistics, quotes, logos, names, sample data or claims. Missing facts become a question or a clearly marked placeholder.
7. **Evidence or it did not happen.** Every PASS in a gate cites what was checked. Every finding cites a rule id, a location and one line of reason.
8. **Safe to install.** No installer, no network, no downloads at runtime, no writes outside the project; scripts read files and print. `allowed-tools` is minimal per skill.

## Skills

| Skill | Job |
|---|---|
| `no-slop` | Core router: principles, mode resolution, precedence, gate summary, which skill when |
| `slop-prose` | Edit or detect AI patterns in writing (voice-preserving), strict mode for docs, optional 5-dimension score; English references plus Vietnamese notes |
| `slop-product-copy` | Microcopy in apps: plain words, no explanation paragraphs, empty/loading/error states, no raw ids or enums, no dash placeholders, i18n keys for both languages |
| `slop-ui` | Visual and interaction slop on web and desktop apps: decoration, fake data, generic layouts, dead controls, direction before building |
| `slop-mobile` | Phone and narrow layouts: reflow, safe areas, tap targets, dynamic type, keyboard, overflow |
| `slop-a11y` | Contrast, keyboard, focus, states, names; ships `scripts/contrast-check.mjs` |
| `slop-code` | Code comment hygiene: remove generic AI comments, keep the ones that carry a reason; never touch code |
| `slop-audit` | AFTER mode: numbered findings file, severity from the rule tier, fix list, follow-up report; the Delivery Gate |

## Rules

Ids are `NS-<area>-<nn>` (`P` prose, `C` copy, `U` UI, `M` mobile, `A` a11y, `K` code, `G` gate). Tier: **H**ard (never ship), **P**urpose (needs a written reason to keep), **Q**uality (fix when cheap). Each rule: one line of what, one of why, a bad and a good example, and `Derived from` where it comes from one of the three source skills.

## Delivery Gate

Scales with the task: a one-line copy edit runs the 5-item small gate; a screen or flow runs the full gate (Hard items answered no, Purpose items justified, Quality items checked). Output is a PASS/FAIL table with evidence per line. A FAIL is fixed or listed with the reason; it is never hidden.

## Deterministic tools

- `slop-lint`: `node scripts/slop-lint.mjs [--lang en|vi|both] [--json] <files or dirs>`. Reads text files, JSON message catalogs (nested keys, `{placeholders}` preserved) and Markdown. Rules in `scripts/rules/*.json` (phrases, patterns, allowlists). Exit 1 on findings of tier H, so it can run in CI and a pre-push hook.
- `contrast-check`: `node scripts/contrast-check.mjs <fg> <bg> [--large]` and a token-file mode, WCAG AA 4.5:1 and 3:1.

## Evals

`evals/` holds fixtures: `bad/` (slop that must be flagged, with the expected rule ids), `good/` (text that must pass, including human text with real voice), and before/after pairs for edits. `node --test` runs the linter against them; the model-judged rules have a rubric file and a manual eval script. Target: zero false positives on `good/`.

## Packaging

Claude Code plugin (`.claude-plugin/plugin.json`, `marketplace.json`), Codex plugin (`.codex-plugin/plugin.json`), and a plain `skills/` folder anyone can copy. MIT, with a `NOTICE` for the three source skills.
