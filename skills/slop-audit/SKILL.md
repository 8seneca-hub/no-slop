---
name: slop-audit
description: AFTER mode. Audit finished work for AI slop and write a numbered findings file, a fix list and a follow-up report, then run the Delivery Gate (small or full). Use for reviews, "is this slop?", release checks and before shipping a screen, flow or document.
allowed-tools: Read Glob Grep Bash Write
---
# slop-audit (NS-G)

Audit reads and reports. It never edits the audited files. The only file it writes is the findings file.

## Rules

| Id | Tier | Rule |
|---|---|---|
| NS-G-01 | H | Read the real files. Never audit from memory or from a summary. |
| NS-G-02 | H | If an app is running, open the rendered screen at desktop and phone width and look. A static read is not enough for UI. |
| NS-G-03 | H | Do not modify audited files in the audit step. Fixes are a separate step. |
| NS-G-04 | P | Every finding has a rule id, a tier, a `file:line` and one line of reason. No id, no finding. |
| NS-G-05 | P | Say what was not reached (files, states, breakpoints, languages). Silence reads as coverage. |
| NS-G-06 | P | Run the deterministic tools first (`slop-lint`, `contrast-check`) and paste their counts. Then judge by hand. |
| NS-G-07 | Q | Severity follows the tier: H high, P medium, Q low. Do not re-rank by taste. |
| NS-G-08 | H | Every gate PASS cites evidence. A PASS without evidence is a FAIL. |
| NS-G-09 | P | A FAIL is fixed or listed with a reason. It is never dropped. |

## Steps

1. Fix the surface (a screen, a flow, a document, a folder) and the skills in play. Load them: `slop-ui`, `slop-mobile`, `slop-a11y`, `slop-product-copy`, `slop-prose`, `slop-code` as the surface needs.
2. Read the files. Record every path read.
3. Run `node scripts/slop-lint.mjs --json <paths>` and, for colour pairs or token files, `node scripts/contrast-check.mjs`. Keep the output.
4. Look at the rendered screen if an app runs. Note viewport sizes and states seen (empty, loading, error, filled).
5. Judge by hand against each skill's checklist (`skills/slop-ui/references/checklist.md`; for prose scoring `skills/slop-prose/references/eval.md`). Do not copy those lists here.
6. Write `anti-slop/audit-<surface>-<YYYY-MM-DD>.md`. Create the folder if it is missing. Slugify the surface (`checkout-flow`). If the file exists, add `-2`.
7. Run the gate and append it.
8. Stop. The owner, or the brief, picks fixes from the fix list.
9. After fixes: re-run the tools, re-read the changed files, append the follow-up report.

## Findings file shape

```md
# Audit: <surface>
Date: YYYY-MM-DD
Skills used: slop-ui, slop-product-copy, slop-a11y
Files read: src/pages/Checkout.tsx, locales/en.json
Tools: slop-lint 14 findings (3 H), contrast-check 2 fails
Rendered: yes, 1280 and 390 wide; states: filled, empty

## Findings
| n | Rule | Tier | File:line | Reason | Fix |
|---|---|---|---|---|---|
| 1 | NS-C-03 | H | locales/en.json:12 | "Oops! Something went wrong" says nothing | Name the failure and the next step |
| 2 | NS-U-05 | P | Checkout.tsx:88 | Button with no handler | Wire it or remove it |

## Contrast
| Pair | Ratio | Needs | Result |
|---|---|---|---|
| #8a8a8a on #ffffff | 3.5 | 4.5 | FAIL |

## Not reached
Dark theme, error states, tablet width.

## Fix list
- [ ] F1 (n1, n4): rewrite the error strings. High.
- [ ] F2 (n2): remove the dead button. Medium.

## Gate
(see below)

## Follow-up (after fixes)
| n | Status | Evidence |
|---|---|---|
| 1 | FIXED | slop-lint clean on locales/en.json; screen rechecked |
| 2 | LISTED | Kept: stub needed for the demo, owner: Linh, until 12 Nov |
```

Contrast section stays even when empty: write "Not checked, reason". Group findings in the fix list so one fix can close several rows.

## Delivery Gate

Output is a PASS or FAIL table, evidence on every line. Use the small gate for a one-line edit, a string, a comment. Use the full gate for a screen, a flow, a document, a release.

### Small gate (5 items)

| Id | Check | Status | Evidence |
|---|---|---|---|
| NS-G-10 | `slop-lint` clean on the changed text, or each hit justified | | command and result |
| NS-G-11 | No invented fact, figure, name or sample data | | what was checked |
| NS-G-12 | Repo rules (`DESIGN.md`, kit, owner rules) followed; conflicts named | | file and line |
| NS-G-13 | Voice (prose) or kit (product) kept | | before and after |
| NS-G-14 | No new slop in the diff beyond the lint | | what was read |

### Full gate

Run the small gate, then every area that applies. H items must be answered no (nothing found). P items need a stated reason. Q items are checked.

| Area | Items to answer | Where the checks live |
|---|---|---|
| Prose (NS-P) | H none; P justified; Q scored if asked | `skills/slop-prose/references/eval.md` |
| Copy (NS-C) | no oops, no explanation paragraphs, no raw ids, no dash placeholders, message keys present | `skills/slop-product-copy/SKILL.md` |
| UI (NS-U) | no fake data, no dead controls, direction named, states shown | `skills/slop-ui/references/checklist.md` |
| Mobile (NS-M) | reflow at 390, safe areas, tap targets, no overflow | `skills/slop-mobile/SKILL.md` |
| A11y (NS-A) | contrast pairs run, keyboard path, focus visible, names | `skills/slop-a11y/SKILL.md` |
| Code (NS-K) | comments earn their place, no code changed | this plugin, `slop-code` |

Table, one row per item:

| Id | Area | Tier | Status | Evidence |
|---|---|---|---|---|
| NS-U-05 | UI | H | PASS | grepped `onClick` on 14 buttons in Checkout.tsx; all wired |
| NS-A-02 | A11y | P | FAIL | muted text 3.5:1, see finding 7; listed, owner Linh |

Gate result is PASS only when no H item fails, every P FAIL has a recorded reason, and nothing is unexamined. Otherwise FAIL.

### Machine-readable result

```json
{"gate":"PASS|FAIL","items":[{"id":"","status":"PASS|FAIL","evidence":""}]}
```

Print it after the tables for loops and CI. `gate` is FAIL if any item is FAIL and not justified. Keep `evidence` to one sentence.

## Report to the owner

Lead with the gate result and the counts by severity. Name the findings file. Give the fix list. Say what was not reached. Stop there.
