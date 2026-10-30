# What the three existing anti-slop skills do, and where each stops

Read 30 Oct 2026 from the repositories themselves (all MIT). Notes are about the files, not their marketing.

| | stop-slop (Hardik Pandya) | no-ai-slop (Peter Yang) | anti-slop (Miqdad Badjuber) |
|---|---|---|---|
| Scope | Prose only | Prose only (writing, posts) | UI and visual, copy, accessibility, mobile layout, code comments |
| Size | 68-line skill + 3 reference files (321 lines) | 97-line skill + 43-line eval | 750-line core + 5 skills + 2 references (2.5k lines) + Node installer + 2 Python scripts |
| Idea | A banned list: filler phrases, structures, adverbs, em dashes, passive voice; score 5 dimensions out of 50, revise below 35 | An editor, not a filter: preserve the writer's voice, minimum effective edit, two jobs (edit, detect), a pass/fail eval after the rewrite | A rulebook of 40 numbered rules in three tiers (Hard Gate, Purpose Gate, Quality Locks), two modes (during, after), a PASS/FAIL Delivery Gate with evidence |
| Best parts | Names the patterns precisely (false agency, narrator from a distance, Wh- starters); the 5-dimension score gives a number | Voice preservation; "portability test" (a sentence that fits any company is filler); never invent facts or stats; detect mode quotes the line and names the pattern; asks for audience and goal | Covers what the others ignore (UI, contrast, keyboard, empty and error states, tap targets, fake stats and testimonials, ghost nav links); numbered rules a review can cite; Delivery Gate; `DESIGN.md` as the direction source |
| Weak parts | Strict to the point of flattening voice (all adverbs, always active voice); no detect mode; English only; no process for when a rule should not apply | Only writing; no UI, product copy or code; English only; no numeric gate | 750-line core loaded every session (tokens); asks "during or after?" every session, which stalls headless agents; the installer edits entry files; some rules are generic or aspirational; absolute bans (em dash) with little room for judgment; English only |
| Enforcement | Prompt only | Prompt only (self-run eval) | Prompt only (self-run gate); the contrast script is the one deterministic check |
| Safety review | Plain markdown | Plain markdown + a plugin build script | Markdown + Python contrast scripts (stdlib only) + `npx` installer that writes files |

## What none of them do (the gap this plugin fills)

1. **No deterministic checks.** Banned phrases, em dashes, filler and contrast ratios can be found by a program. All three leave it to the model to notice, so it fails on long files and tired sessions. A linter catches the mechanical part and leaves judgment to the model.
2. **No Vietnamese.** Every list is English. 8seneca ships `en` and `vi` for every user-facing string.
3. **No product-UI copy.** Prose skills target essays and posts. The slop in apps is microcopy: explanation paragraphs under fields, "Oops! Something went wrong", empty states that sell, raw enums and ids, dash placeholders.
4. **Always-on cost.** Only one of the three loads progressively. The core should be a router of about 100 lines.
5. **No headless contract.** Agents in a loop cannot answer a mode question. Mode must come from the brief, the repo file or the task type.
6. **No local precedence.** None says what wins when the repo has its own design system or rules. This plugin states it: the repo's `DESIGN.md`, component kit and owner rules win, and the conflict is named.
7. **No regression tests.** None ships fixtures proving a rule fires on slop and stays quiet on good text.

## What we take from each

- From stop-slop: the pattern names, the five-dimension score (as an optional prose gate), sentence-starter and rhythm checks.
- From no-ai-slop: voice-preserving minimal edit as the default for personal writing, detect mode, the portability test, never invent facts, ask for audience and goal only when it changes the edit.
- From anti-slop: the three rule tiers, numbered rules, the evidence-backed gate, during and after modes, direction from `DESIGN.md`, the accessibility and mobile checks.

All wording in this plugin is rewritten; rules keep a `Derived from` note where an idea comes from one of the three (see `NOTICE`).
