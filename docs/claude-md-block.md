# CLAUDE.md block

Paste this into a repo's `CLAUDE.md` (or `AGENTS.md`). Edit the values; delete lines you do not need.

```md
## no-slop
- Mode: during for edits and builds; after for reviews and audits. Never ask me which.
- Direction: DESIGN.md and the component kit in `src/ui/` win over any no-slop rule. Name every conflict in your notes.
- Voice: personal writing keeps the author's voice (minimal edit). Product copy and docs follow the strict rules.
- Linter: run `node scripts/slop-lint.mjs <changed files>` before you finish. Fix every H finding.
- Gate: small gate for one-line edits, full gate for a screen, flow or document. Show PASS or FAIL with evidence.
- Audits go to `anti-slop/audit-<surface>-<date>.md`. Do not edit audited files in the audit step.
- Never invent numbers, quotes, names, logos or sample data. Use a marked placeholder and list it.
```

Machine-readable settings go in `.no-slop.json` at the repo root:

```json
{ "ignore": ["vendor/**"], "disable": ["NS-P-23"], "failOn": "H" }
```
