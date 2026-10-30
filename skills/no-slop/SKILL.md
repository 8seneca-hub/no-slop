---
name: no-slop
description: Always-on router that keeps generic AI output out of prose, product copy, UI, mobile layout, accessibility and code comments. Use when writing, editing, reviewing or auditing anything a person will read or use, and to choose the right slop skill and mode.
allowed-tools: Read Glob Grep
---
# no-slop

A filter, not a style guide. It removes generic AI output and leaves direction to the repo (`DESIGN.md`, the component kit, `CLAUDE.md`). This file only routes. Load the skill for the task; load its references on demand.

## Principles

1. Route first. Load only the skill the task needs.
2. Run the linter for anything mechanical (`node scripts/slop-lint.mjs`). Spend judgment on structure, voice, specificity and design.
3. People's own writing: smallest edit, keep their voice. Product copy and docs: strict and uniform.
4. Never ask an agent for the mode. Resolve it (below).
5. The repo wins over this plugin. Name every conflict.
6. Never invent facts, numbers, quotes, names, logos or sample data.
7. Evidence or it did not happen: a PASS cites what was checked, a finding cites a rule id and a location.
8. Safe by construction: no network, no downloads, no writes outside the project.

## Which skill

| Task | Load |
|---|---|
| Write, edit or check prose, posts, docs, release notes | `slop-prose` |
| Labels, buttons, empty, loading and error states, i18n (en and vi) | `slop-product-copy` |
| Web or desktop screens, components, layout, fake data, dead controls | `slop-ui` |
| Phone or narrow layout, safe areas, tap targets, keyboard | `slop-mobile` |
| Contrast, keyboard, focus, names, states | `slop-a11y` |
| Code comments, commit messages, PR text | `slop-code` |
| Review, audit, "is this slop?", delivery check | `slop-audit` |

A screen usually needs `slop-ui`, `slop-product-copy` and `slop-a11y`, plus `slop-mobile` when it must work on a phone. Load each once.

## Modes

- **during**: apply the rules while you write or edit.
- **after**: read finished work, report findings, change nothing (`slop-audit`).
- **detect**: quote the line, name the pattern, give the rule id. No rewrite unless asked.

Resolve the mode in this order and stop at the first hit:

1. The user's explicit instruction.
2. The brief or ticket.
3. `.no-slop.json` at the repo root, or the `no-slop` block in `CLAUDE.md`.
4. The task type: build or edit means during; audit, review, "is this slop?" means after or detect.

In a headless or loop run, never ask: take the task-type default and say which mode you used. In an interactive chat, ask one question at most, and only when steps 1 to 4 leave two modes equally likely.

## Precedence

1. The user's explicit instruction.
2. The repo: `DESIGN.md`, the component kit, `CLAUDE.md`, owner rules.
3. These skills.

When a repo rule and a skill rule disagree, follow the repo and write one line: `Conflict: NS-U-07 vs DESIGN.md "dense tables"; followed DESIGN.md`. Never resolve a conflict silently.

## Tiers

| Tier | Meaning | Action |
|---|---|---|
| H (Hard) | Never ship | Fix. No exception. |
| P (Purpose) | Needs a written reason to stay | Fix, or keep with the reason on record. |
| Q (Quality) | Weak but harmless | Fix when the fix is cheap. |

Severity in audits follows the tier: H high, P medium, Q low.

## Gate

Every finished task gets a Delivery Gate with PASS or FAIL and evidence per line (`slop-audit` holds the tables).

- **Small gate** (5 items): one-line edits, a single string, a single comment. Linter clean, no invented facts, repo rules respected, voice or kit kept, no new slop in the diff.
- **Full gate**: a screen, a flow, a document, a release. Every area that applies: H items answered no, P items justified, Q items checked.

A FAIL is fixed, or listed with its reason. It is never hidden.

## No invention

If a fact, figure, name, quote, logo or sample row is missing, ask in an interactive chat or leave a marked placeholder (`[NEEDS: monthly price]`) in a headless run, and list it in the notes. Do not fill it with something plausible.

## Rule ids

`NS-<area>-<nn>`: P prose, C copy, U ui, M mobile, A a11y, K code, G gate. Cite them in findings and conflict notes.
