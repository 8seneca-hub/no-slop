# no-slop

no-slop is a Claude Code and Codex plugin that stops generic AI output in prose, product copy, UI, mobile layout, accessibility and code comments. It filters; direction still comes from your repo's `DESIGN.md`, component kit and `CLAUDE.md`.

A small router skill is always loaded and sends each task to one focused skill. A zero-dependency Node linter handles the mechanical checks in English.

## Install

Claude Code:

```
/plugin marketplace add 8seneca-hub/no-slop
/plugin install no-slop@no-slop
```

Codex: add the repo as a plugin source; it reads `.codex-plugin/plugin.json`.

Plain folder: copy `skills/` into your agent's skills directory (for Claude Code, `.claude/skills/`). Copy `scripts/` if you want the linter and contrast tool.

Requires Node 20 or newer for the scripts. The skills need nothing.

## Skills

| Skill | Job |
|---|---|
| `no-slop` | Router: principles, mode, precedence, gate summary |
| `slop-prose` | Edit or detect AI patterns in writing, keeping the author's voice |
| `slop-product-copy` | App microcopy: plain words, states, no raw ids or dash placeholders |
| `slop-ui` | Web and desktop UI: fake data, dead controls, generic layout |
| `slop-mobile` | Phone and narrow layouts: reflow, safe areas, tap targets |
| `slop-a11y` | Contrast, keyboard, focus, names |
| `slop-code` | Code comments, commit messages, PR text |
| `slop-audit` | Findings file, fix list, Delivery Gate |

## Modes

The mode is resolved, never asked in a headless run: your instruction, then the brief, then `.no-slop.json` or the `no-slop` block in `CLAUDE.md`, then the task type.

- **during**: apply rules while writing. `Rewrite this release note with no-slop.`
- **after**: audit finished work, change nothing. `Audit the checkout screen with no-slop.` Writes `anti-slop/audit-checkout-2026-10-30.md`.
- **detect**: quote the line, name the pattern. `Is this slop? <text>`

## Tools

Linter (reads files, prints, writes nothing, no network):

```
node scripts/slop-lint.mjs [--scope prose|copy|ui|code-comment] [--json] [--fail-on H|P|Q] [--rules <dir>] <files or dirs>
node scripts/slop-lint.mjs docs/ locales/
node scripts/slop-lint.mjs --scope code-comment --json src/
```

`.md` and `.txt` are prose (fenced and inline code skipped). `.json` is a message catalog: string values only, `{placeholders}` and ICU plurals left intact, location is the key path. Output is `file:line:col id tier message`, or a JSON array. Exit 1 when a finding at or above `--fail-on` exists (default H), 2 on usage errors. Silence one hit with `no-slop-ignore NS-C-04` in a comment on the same or previous line. Rules live in `scripts/rules/*.json`; ids are `NS-<area>-<nn>.<suffix>` and every option that takes an id also takes the parent (`NS-C-04`).

Contrast checker:

```
node scripts/contrast-check.mjs "#767676" "#ffffff"
node scripts/contrast-check.mjs "#767676" "#ffffff" --large
```

See `skills/slop-a11y/SKILL.md` for the token-file mode.

Evals: `npm run evals` (or `node evals/run.mjs`). Tests: `npm test`.

## How it differs

Compared with stop-slop, no-ai-slop and anti-slop (details in `docs/COMPARISON.md`):

- The always-loaded core is a router of at most 120 lines, not a rulebook.
- Mechanical checks are code (a linter and a contrast tool), not prompts.
- English rules and catalog linting.
- Product microcopy, UI, mobile and code comments in one plugin.
- A headless mode contract and a stated precedence: the repo wins, conflicts are named.
- Fixtures prove rules fire on slop and stay quiet on good text.

## Configuration

`.no-slop.json` at the repo root:

```json
{ "ignore": ["vendor/**"], "disable": ["NS-P-23"], "failOn": "H" }
```

Paste the block from `docs/claude-md-block.md` into `CLAUDE.md` to set mode, languages and gate rules.

## Security

No installer, no network access, no downloads at runtime. Scripts read files and print; they never write. Each skill lists a minimal `allowed-tools`; only `slop-audit` writes (its findings file) and only `slop-code` edits comments. Audit output goes to `anti-slop/` inside the project.

## Contributing

Add a rule to `scripts/rules/*.json` with a parent id, a tier (H, P or Q), a message and a fix. Add a fixture to `evals/bad/` and one to `evals/good/` that would collide with it, update `evals/expected.json`, then run `npm test` and `npm run evals`. Fix false positives by trimming the rule, not by weakening the linter. Write rules in your own words.

## License

MIT, see `LICENSE`. Credits to the three source projects are in `NOTICE`.
