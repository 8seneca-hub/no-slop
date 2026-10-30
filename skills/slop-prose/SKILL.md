---
name: slop-prose
description: Edit or check writing for generic AI patterns (filler, binary contrasts, puffery, fake-profound endings, recap closers). Use when the user asks to clean up, humanize, tighten or review a draft, README, doc, post or email, or asks "does this sound like AI". Not for text inside an app (use slop-product-copy).
allowed-tools: Read Write Edit Glob Grep
---

# slop-prose

Removes the patterns that make text read as machine-made, and leaves the rest alone. It filters; it does not set a style. If the repo has its own voice rules (`DESIGN.md`, `CLAUDE.md`, `.no-slop.json`), those win. Name any conflict in the notes.

## Pick the job

Order of precedence: the user's words, the brief, the repo config, then the task type.

| Job | When | Output |
|---|---|---|
| EDIT (default) | "clean up", "tighten", "make this sound human", any draft handed over to improve | Full edited text, then a short **What changed** list |
| DETECT | "review", "is this slop", "check", "audit", or the user says not to rewrite | Per finding: quoted line, rule id, fix in a few words. No rewrite, no claim about who wrote it |
| STRICT | docs, README, specs, release notes, any text with no personal voice to protect | EDIT with every Hard and Purpose rule enforced, score reported |

Do not ask which job. Ask about audience and goal only when the answer changes the edit (a cold email and a design doc need different cuts). In a headless run, assume a smart reader who is new to the topic.

## Method (EDIT)

1. Read the whole text once. Find the voice first: `references/voice.md`.
2. Mark every sentence that breaks a rule below. Leave sentences that do not.
3. Fix by the smallest change: cut a phrase, state the point, swap one word. Rewrite a sentence only when the structure is the slop.
4. Keep the author's vocabulary, rhythm, jokes, hedges that carry real doubt, and their level of polish. Do not make every paragraph equally tidy.
5. Run `references/eval.md`. Fix any fail, then return the text.
6. Give **What changed** in at most 6 lines: pattern, rule id, where. Say what you protected on purpose.

Cut in proportion. A clean draft gets a near-zero edit and one line saying so.

## Never

- NS-P-01 (H) Invent facts, numbers, quotes, names, sources or examples. Missing support becomes a question or a marked gap: `[source needed]`.
- Change the claim, the stance or the facts while fixing style.
- Flatten a human voice to satisfy a rule. See "when a rule may break" in `references/voice.md`.
- Call the text "AI-written" in DETECT. Report patterns, not authorship.

## Rules

Tier: H = fix always, P = fix unless a written reason says keep, Q = fix when cheap. Phrase lists in `references/phrases.md`, structure notes in `references/structures.md`, pairs in `references/examples.md`.

| Id | Tier | Rule |
|---|---|---|
| NS-P-01 | H | No invented facts, stats, quotes or sources |
| NS-P-02 | P | No throat-clearing openers ("Here's the thing", "It's worth noting") |
| NS-P-03 | Q | No emphasis crutches and intensifiers ("truly", "game-changer") |
| NS-P-04 | P | No binary contrast ("It's not X, it's Y") unless someone really claimed X |
| NS-P-05 | Q | No negative listing ("Not a tool. Not a plan.") |
| NS-P-06 | Q | No faux-insight setups, colon reveals or self-answered questions |
| NS-P-07 | Q | No dramatic fragments stacked for effect |
| NS-P-08 | P | No false agency: things do not "decide", "emerge" or "become" for people. Name the actor |
| NS-P-09 | Q | No narrator from a distance ("Nobody designed this"). Put the reader or a named person in the scene |
| NS-P-10 | P | Cut fake-profound kickers; end on the concrete point, never rewrite them into a better metaphor |
| NS-P-11 | Q | No recap ending that restates the body |
| NS-P-12 | Q | No synonym cycling; repeat the plain noun |
| NS-P-13 | Q | No formatting slop: emoji headings, decorative bold, bullets that should be prose, headers over two lines |
| NS-P-14 | Q | Watch sentence starters: Wh- openers, "Moreover/Furthermore", three starts alike |
| NS-P-15 | Q | Vary rhythm; no run of equal-length sentences, no reflexive lists of three |
| NS-P-16 | Q | No business jargon ("leverage", "move the needle") |
| NS-P-17 | P | No puffery or importance inflation without a fact behind it |
| NS-P-18 | P | No weasel attribution ("experts say"). Name the source or drop the claim |
| NS-P-19 | Q | No hedge stacks. One hedge, where the doubt is real |
| NS-P-20 | Q | No meta-commentary ("In this section we will", "In conclusion") |
| NS-P-21 | Q | Em dash: none in short text, at most two in a long piece. Hard (H) in product copy and UI |
| NS-P-22 | P | Portability: if the sentence fits any company or topic, make it specific or cut it |
| NS-P-23 | Q | Cut padding words and adverbs that add nothing ("in order to", "basically") |
| NS-P-24 | Q | Vietnamese patterns: see `references/vi.md` (DRAFT, needs native review) |
| NS-P-25 | H | No chatbot residue ("I hope this helps", "Great question") |

### Portability test (NS-P-22)

Swap in a competitor's name or a different topic. If the sentence still reads true, it says nothing. Replace it with a fact from the text (a number, a name, a date, a decision) or cut it. If the facts are not in the text, ask or mark the gap. Do not make one up.

## Deterministic check

`node scripts/slop-lint.mjs <file>` finds the mechanical hits (phrases, em dashes, contrast patterns) in English and Vietnamese. Run it when the file is long; it does not see structure, voice or portability, so the judgment rules above stay yours. The lint output is evidence, not an edit list: a phrase inside a quote or a code sample stays.

## Score (optional)

Only when the user asks, or in STRICT mode. Rate 1-10 on directness, rhythm, trust, authenticity, density (rubric in `references/eval.md`). Total of 50. Below 35: revise once, then report the new score. Never show a score on a DETECT request unless asked.

## Output shapes

EDIT:

```
<edited text>

What changed
- NS-P-02 cut opener in para 1
- NS-P-04 "not a tool, it's a team" now says what the team does
Kept on purpose: the short blunt last line, "bloody" in para 3
```

DETECT:

```
L4  "It's worth noting that..."  NS-P-02  start at the claim
L9  "not a tool, it's a team"   NS-P-04  say what the team does
L12 "experts say"               NS-P-18  name who, or cut
```

## References

- `references/phrases.md` banned and often-empty phrases, grouped
- `references/structures.md` structural patterns with the fix for each
- `references/examples.md` before and after pairs, including voices to keep
- `references/voice.md` finding and protecting a voice; when a rule may break
- `references/eval.md` post-edit checklist and the score rubric
- `references/vi.md` Vietnamese patterns (DRAFT)
