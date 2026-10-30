# Evals

Fixtures that prove the linter fires on slop and stays quiet on good text.

- `bad/`: files that must be flagged. `expected.json` lists the rule ids each one must trigger. Ids can be a parent (`NS-P-03`, matches every child) or a full id (`NS-P-03.01`).
- `good/`: files that must produce zero findings. They include human text with a real voice, clean message catalogs in English (with `{placeholders}` and ICU plurals), technical docs, and code comments that carry a reason.
- `expected.json`: file path (relative to `evals/`) to a list of rule ids. A good file maps to `[]`.
- `run.mjs`: runs `scripts/slop-lint.mjs --json` on each fixture, prints a table and exits 1 on a missed rule in `bad/`, on any finding in `good/`, or on a fixture that is not in `expected.json`.

Run: `node evals/run.mjs`

Extra findings in `bad/` are fine; only the listed ids are required. A false positive in `good/` is fixed by trimming the rule or adding an allowlist entry in the rules data, not by weakening the linter.

Add a case: drop a file in `bad/` or `good/`, add a line to `expected.json`, run the script. Fixtures in `bad/` are deliberately sloppy; the repo `.no-slop.json` does not ignore them, so do not point `npm run lint` at `evals/bad`.

The model-judged rules (structure, voice, layout) are not covered here. They have rubrics in `skills/slop-prose/references/eval.md` and `skills/slop-ui/references/checklist.md`, run by hand.
