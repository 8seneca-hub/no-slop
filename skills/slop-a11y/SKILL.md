---
name: slop-a11y
description: Use when building, editing or reviewing any interface for accessibility, or when colours, focus, keyboard use, forms, dialogs, menus, tabs, toasts or tables change. Checks contrast with a script and cites WCAG 2.2 AA criteria.
allowed-tools: Read Write Edit Glob Grep Bash(node *)
---
# slop-a11y

Target: WCAG 2.2 AA. Tiers: **H** never ship, **P** needs a written reason, **Q** fix when cheap. Findings cite id, location, one line of reason, and the WCAG criterion from `references/wcag.md`. Markup patterns for dialog, menu, tabs, combobox, toast, table and form errors: `references/patterns.md`. Prefer native elements (`button`, `a`, `input`, `select`, `dialog`) over ARIA on a `div`: the first rule of ARIA is not to need it.

## Contrast and colour

**NS-A-01 [H] Text contrast AA in both themes.** 4.5:1 for normal text, 3:1 for large text (24 px, or 19 px bold). Placeholder, disabled-but-informative and text on images count. Run it, do not eyeball it:
`node scripts/contrast-check.mjs "#6b7280" "#ffffff"` or `node scripts/contrast-check.mjs --tokens tokens.css --pairs "text:surface,muted:surface"` (checks each theme block; exit 1 on a fail). Fix by changing the token, not the one component.

**NS-A-02 [H] UI component and graphic contrast 3:1.** Input borders, icon-only buttons, focus rings, chart lines, toggles in on and off states, against their neighbours. Check with the same script and `--large`.

**NS-A-03 [H] State is not shown by colour alone.** Errors, success, selection, required, links in text and chart series also use an icon, text, underline, pattern or position. Bad: a red border as the only error signal. Good: red border, an error icon and the message "Enter an email address".

## Keyboard and focus

**NS-A-04 [H] Everything works with the keyboard.** Tab and Shift+Tab reach every control in reading order; Enter activates links and buttons, Space activates buttons, checkboxes and toggles; Escape closes overlays and returns focus to the trigger. No `div onClick` without role, tabindex and key handlers. Avoid `tabindex` above 0.

**NS-A-05 [H] Visible focus.** Every focusable element shows a focus indicator of at least 3:1 against its surroundings, not hidden by `outline: none` without a replacement, and not clipped by `overflow`. Use `:focus-visible`. Focus must not be covered by sticky headers (WCAG 2.4.11).

**NS-A-06 [H] No focus traps.** A modal traps focus on purpose and releases on close; nothing else does. Focus moves into a new dialog, returns to the trigger on close, and the page behind is inert. Test by tabbing through the whole page and out.

**NS-A-07 [P] Composites use arrow keys.** Tabs, menus, listboxes, radio groups, tree views and grids use one tab stop and arrow keys inside (roving tabindex or `aria-activedescendant`), with Home and End. Follow `references/patterns.md`.

## Names, structure, language

**NS-A-08 [H] Every control has an accessible name.** Icon buttons get `aria-label` or visible text; links say where they go ("Download invoice", not "Click here"); the name contains the visible label (WCAG 2.5.3). Check names in the accessibility tree, not just the markup.

**NS-A-09 [H] Every image has the right alt.** Informative: say what it shows or does. Decorative: `alt=""` (or `aria-hidden` for icons beside text). Charts: a text summary or data table. Never `alt="image"` or a file name.

**NS-A-10 [H] Labels tied to fields.** Each input has a `<label for>` or wraps the input; placeholder is not a label. Group radios and checkboxes with `fieldset` and `legend`. Mark required fields in text, and set `autocomplete` on personal data.

**NS-A-11 [H] Errors tied to fields and announced.** The message sits next to the field, is linked with `aria-describedby`, the field gets `aria-invalid="true"`, and on submit focus goes to the first error or a summary with links. Say what is wrong and how to fix it. Never rely on a toast alone.

**NS-A-12 [H] Language attribute.** `<html lang="en">` or `vi`; set `lang` on passages in another language. Why: screen readers pick pronunciation from it.

**NS-A-13 [Q] Headings in order, landmarks present.** One `h1`, no skipped levels, headings describe sections and are not used for size. Use `header`, `nav`, `main`, `aside`, `footer`; label a landmark when there are two of the same kind. Provide a skip link when there is repeated navigation.

## Motion and change

**NS-A-14 [P] Reduced motion.** Under `prefers-reduced-motion: reduce`, remove parallax, auto-play, large movement and looping; keep fades or instant changes. Nothing flashes more than 3 times a second. Moving or auto-updating content can be paused.

**NS-A-15 [H] Live regions for async updates.** Toasts, form results, search result counts, loading and errors are announced: `role="status"` (polite) for success and progress, `role="alert"` for errors that need action now. The live region exists in the DOM before its content changes. Do not announce every keystroke.

**NS-A-16 [H] Target size.** Pointer targets at least 24 by 24 CSS px with spacing (WCAG 2.5.8); aim for 44 by 44 on touch (see NS-M-04).

**NS-A-17 [H] Zoom to 200% and reflow at 320 px.** No loss of content or function at 200% text size and at 320 CSS px width without two-dimensional scrolling (tables and maps excepted). Do not disable pinch zoom (`user-scalable=no`, `maximum-scale=1`).

**NS-A-18 [Q] Dragging and timing alternatives.** Every drag has a click alternative (WCAG 2.5.7); timeouts can be extended; authentication does not rely on remembering or retyping (paste is allowed).

## How to check

1. Contrast: run the script on every token pair, both themes.
2. Keyboard: unplug the mouse; do the main task with keys only; confirm the focus ring is always visible.
3. Names and structure: read the accessibility tree (browser devtools, or the Playwright accessibility snapshot) for the changed screens.
4. Zoom to 200%, then set width to 320.
5. Turn on reduced motion in devtools and re-run the flow.

Small gate (one component): NS-A-01, 04, 05, 08, 10 or 11 as relevant. Full gate: all Hard items PASS with evidence (command output, tree excerpt, key sequence); Purpose items carry a reason; Quality items fixed or listed. Automated tools find about a third of issues; say what was checked by hand and what was not. Unverified items are listed as unverified, never as PASS.
