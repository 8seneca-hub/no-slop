---
name: slop-product-copy
description: Write or review text inside an app or product UI (labels, buttons, errors, empty and loading states, toasts, message catalogs). Use when building or editing screens, i18n files or microcopy, or when asked to remove explanation text, "Oops" errors, raw ids, dash placeholders or inconsistent terms. Not for essays or docs (use slop-prose).
allowed-tools: Read Write Edit Glob Grep
---

# slop-product-copy

Text inside the product is strict and uniform: there is no personal voice to protect. The repo wins: its `DESIGN.md`, glossary, component kit and owner rules override this file. Name any conflict in the notes.

## Mode

Resolved without asking: user words, then the brief, then repo config, then task type. Build or edit a screen = DURING (apply rules as you write). Review or "is this slop" = AFTER (list findings with ids, then fix). Never invent data: sample names, counts, quotes and prices stay marked placeholders or come from the repo.

## Rules

Tier: H = never ship, P = keep only with a written reason, Q = fix when cheap.

| Id | Tier | Rule |
|---|---|---|
| NS-C-01 | H | Plain words a user would say. No jargon, no system terms, no "successfully" |
| NS-C-02 | H | No explanation paragraphs under fields, headings or tables. Use a short label, or a tooltip for the rare case |
| NS-C-03 | P | A button names its action ("Save changes", "Send invoice"). Not "OK", "Submit", "Click here". Links name the destination |
| NS-C-04 | H | Errors say what happened and what to do next. No blame, no "Oops", no "Something went wrong" alone, no "invalid" about the user |
| NS-C-05 | P | Empty state: what is missing, plus the one next action. Never a sales pitch |
| NS-C-06 | Q | Loading: say what is loading ("Loading invoices") or show a skeleton; no "Please wait" and no spinner text that lies about progress |
| NS-C-07 | H | No raw ids, enums, codes, snake_case, UUIDs or untranslated message keys on screen. Map to a label |
| NS-C-08 | H | No dash or "n/a" for an empty value. Hide the row, or write "Not set" |
| NS-C-09 | P | One label, one meaning. One concept, one word, everywhere (not Client / Customer / Account) |
| NS-C-10 | Q | Show people by full name, never by id, email prefix or first name alone, unless the layout is a chat |
| NS-C-11 | P | Numbers, dates, currency and units follow the locale (Intl formatting), never string-built |
| NS-C-12 | H | Every string has a message key, no hard-coded literals in components |
| NS-C-13 | P | No hard-coded plural or gender. Use ICU plural and select messages; avoid "(s)" |
| NS-C-14 | Q | Sentence case for buttons, labels, headings. Capitalise names only |
| NS-C-15 | H | No emoji as icons or bullets. Use the icon kit |
| NS-C-16 | Q | No exclamation marks. In errors it is Hard (H) |
| NS-C-17 | Q | No "please" padding; no "we apologise" filler. Use the plain verb |
| NS-C-18 | Q | Length limits below |
| NS-C-19 | H | No leftover TODO, FIXME, TBD, "Lorem ipsum" or placeholder text |
| NS-C-20 | H | No em dash in app text. Two short sentences or a colon |

Shared prose rules still apply in app text: NS-P-03 (emphasis), NS-P-16 (jargon), NS-P-17 (puffery), NS-P-25 (chatbot residue).

## Patterns

**Errors (NS-C-04).** Shape: what happened + what to do. "Could not save the invoice. Check your connection and try again." Name the field and the fix for validation: "Enter a date after 1 May." The system takes the blame, not the user: "We could not reach the server" beats "You entered a wrong value". No error codes on screen; log them. Keep the retry as a button, not a sentence.

**Empty states (NS-C-05).** One line of fact, one action button. "No invoices yet" + "Create invoice". Not "Unlock the power of invoicing!". If the user lacks permission, say that instead and name who can help.

**Loading (NS-C-06).** Name the thing. Under about a second, show nothing or a skeleton. Do not promise a time you cannot know.

**Explanation text (NS-C-02).** If a field needs a paragraph, the label is wrong or the field is too hard. Shorten the label first; then a one-line hint under 60 characters; then a tooltip. A permanent paragraph under every heading is slop.

**Empty values (NS-C-08).** Dash rows tell the user nothing. Hide an optional row. For a required row, "Not set" with the action to set it. For numbers, `0` is a value; do not replace it.

**Terms (NS-C-09).** Keep a glossary in the repo. One word per concept. Check with a search before you add a new label.

**Keys and locales (NS-C-12, 13).** Key by place and meaning (`invoice.empty.title`), not by the English text. Do not build sentences from fragments ("You have " + n + " items"); give translators the whole message with placeholders. Write plurals through ICU, not by adding "s".

## Length limits (NS-C-18)

| Element | Limit |
|---|---|
| Button | 1 to 3 words, 24 characters |
| Label | 3 words, 32 characters |
| Hint or tooltip | One sentence, 80 characters |
| Toast | One sentence, 90 characters, no action hidden in prose |
| Error | Two short sentences, 140 characters |
| Heading | 6 words |
| Empty state | One line plus one action |


## Check

`node scripts/slop-lint.mjs <catalog or source files>` finds phrases, dashes, placeholders, enums, ids, UUIDs and missing-key shapes. It cannot see term consistency or whether a hint is needed; do those yourself. Delivery gate for a screen: H items answered "none", P items justified, Q items checked, each line with evidence (file and key).

## Output

DURING: the code or catalog change, plus a three-line note for any choice that departs from the repo. AFTER: a table of `file:key | rule id | tier | fix`, then the fixes.

References: `references/examples.md` (12 before and after rows).
