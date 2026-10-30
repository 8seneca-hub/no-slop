# Eval

Run after an EDIT. Answer pass or fail with a few words of evidence. Any fail: fix, then re-run. For DETECT, check only the last section.

## Checklist

Facts and meaning
1. Same claims, stance and facts as the draft? No added stat, quote, name, source or example (NS-P-01).
2. Every gap marked ("[source needed]") instead of filled?

Voice
3. Would the author recognise this as theirs? Their distinctive words, bluntness, humor and doubt are intact.
4. Strong human sentences left alone? The edit is proportional to the actual slop.
5. Every kept pattern is listed under "Kept on purpose".

Patterns
6. No throat-clearing, faux-insight, emphasis crutches, meta-commentary (NS-P-02, 03, 06, 20).
7. No binary contrast, negative listing, colon reveal, dramatic fragment stack (NS-P-04, 05, 06, 07).
8. No false agency, no narrator from a distance (NS-P-08, 09).
9. No fake-profound kicker, no recap ending (NS-P-10, 11).
10. No puffery, weasel attribution, jargon, hedge stack (NS-P-16, 17, 18, 19).
11. No synonym cycling, formatting slop, or run of equal-length sentences (NS-P-12, 13, 15).
12. Em dash count within limit (NS-P-21).
13. Each generic sentence passed the portability test or was cut (NS-P-22).
14. No chatbot residue (NS-P-25).

Output
15. Full edited text plus a What changed list of at most 6 lines.
16. If the file is long, `node scripts/slop-lint.mjs` was run and its hits were handled or justified.

## DETECT check

- Each finding quotes the line, names one rule id, and gives a fix in a few words.
- No rewrite, no authorship claim, no score unless asked.

## Score rubric (1-10 each, total 50, below 35 revise)

Use only when asked, or in STRICT mode.

| Dimension | 1-3 | 4-7 | 8-10 |
|---|---|---|---|
| Directness | Mostly announcements and setups | Some statements, some lead-ins | Every paragraph opens on its point |
| Rhythm | Metronomic, same shapes, staged punch lines | Mixed, a few repeats | Varied, endings differ, nothing staged |
| Trust | Explains the obvious, reassures, repeats | Occasional hand-holding | Facts stated once, reader assumed smart |
| Authenticity | Generic, could be anyone's | Some real detail | Named things, real doubt, a person is audible |
| Density | Whole paragraphs cuttable | A few cuttable sentences | Nothing to cut without losing a fact |

Report as: `Directness 8, Rhythm 7, Trust 8, Authenticity 6, Density 8 = 37/50`. After one revision, report the new total and stop.
