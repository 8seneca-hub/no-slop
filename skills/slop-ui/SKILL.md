---
name: slop-ui
description: Use when building, editing or reviewing any web or desktop app screen, component, page or flow. Stops decoration without meaning, fake data, dead controls, missing states and generic layouts. Reads the repo's DESIGN.md and component kit first.
allowed-tools: Read Write Edit Glob Grep
---
# slop-ui

Visual and interaction slop on web and desktop apps. Phones: also load `slop-mobile`. Contrast, keyboard and names: `slop-a11y`. Strings in the UI: `slop-product-copy`.

Tiers: **H** never ship. **P** keep only with a written reason (one line in the notes or a code comment). **Q** fix when cheap. Each finding cites its id, a location and one line of reason. Catalogue of tells: `references/patterns.md`. Gate questions: `references/checklist.md`.

## Direction

**NS-U-01 [H] Read the direction before building.** Look for `DESIGN.md`, the component kit, the token file and `CLAUDE.md` UI notes. Follow them. Why: without them every choice comes from the model's default, which is the definition of slop. Repo rules beat this skill; name a conflict in the notes.

**NS-U-02 [H] No direction means a labelled draft.** If nothing exists, say "draft without direction" in the delivery notes and use the lowest-energy defaults: system font stack, neutral greys, one accent, small radius, no gradients, no shadows beyond one elevation. Never invent a brand name, logo, tagline or palette story. Why: a quiet draft is easy to restyle; a confident invented brand is not.

**NS-U-16 [P] Kit first.** Use the repo's components (button, input, dialog, table, toast). If a pattern is missing, add it to the kit with its states, then use it. Do not build a one-off local copy. Bad: a hand-styled `<div class="btn">` beside `<Button>`. Good: `<Button variant="secondary">`.

## Decoration and layout

**NS-U-03 [P] Decoration must carry meaning.** Gradients, glass blur, glow, blobs, grid or dot backgrounds, floating orbs, big soft shadows: each needs a reason tied to hierarchy or brand, and at most one or two per screen. Why: when every surface is special none is. Bad: blue-to-purple gradient behind every section. Good: flat surface, one elevated menu with a shadow.

**NS-U-19 [P] No template layouts.** Avoid card-everything, three equal feature columns with an icon and a title and a sentence, stock hero with a headline over an abstract image, centred everything, a CTA band at the end of every page. Pick the layout from the task: a table for records, a form for input, a list for a feed. Why: the shape tells the reader nothing about this product.

**NS-U-06 [Q] One icon set, no emoji as icons.** One library, one stroke weight, one size scale. Icons that sit beside text get a text label or an accessible name. Bad: a rocket emoji for "Launch". Good: the kit's `Play` icon with the label.

**NS-U-07 [Q] One radius scale, one spacing scale.** Pick 2 or 3 radii and a 4 or 8 point spacing scale from tokens; do not mix 6, 10 and 14 px by feel. Pill everywhere is a default, not a choice.

**NS-U-08 [Q] Type scale and measure.** 4 to 6 sizes from tokens, at most two weights in a view, body lines 45 to 75 characters, line height 1.4 to 1.6 for body. Why: scale and measure make hierarchy readable without decoration.

## Colour and tokens

**NS-U-04 [P] Colour by meaning only.** Red for destructive or error, amber for warning, green for success, the accent for the main action and selection, greys for the rest. Cap the palette at the neutral base, one or two core colours and one accent. Colour never carries state alone (see NS-A-03).

**NS-U-05 [H] Tokens, not hex.** No raw colours, font sizes, radii or shadows in components. Use the token or add one to the token file first. Bad: `color: #6b7280`. Good: `color: var(--text-muted)`. Why: raw values break themes and drift.

**NS-U-14 [H] Light and dark both work.** If the repo supports both, check both. If it supports one, do not force the other. Dark is chosen for the product and audience, not for looks. Check contrast in both (`scripts/contrast-check.mjs`).

## Motion

**NS-U-09 [P] Motion with a purpose.** Animate to show cause (a panel opening from its button), state change or loading. 150 to 250 ms, ease-out. No looping decoration, parallax, or entrance animation on every block. Honour `prefers-reduced-motion`: replace movement with a fade or nothing. Bad: cards bounce in on scroll. Good: toast slides in, and just appears under reduced motion.

## Real behaviour

**NS-U-10 [H] No dead controls.** Every button, menu item, tab, link, toggle and form does something real, or is visibly disabled with the reason on hover or beside it. No `href="#"`, no empty handlers, no submit that only shows a toast. Why: a control that does nothing is a lie on screen.

**NS-U-11 [H] Navigation points to pages that exist.** Every nav, footer and breadcrumb link resolves to a built route or is removed. Do not list "Pricing", "Docs" or "Blog" that are not there. Check by grepping the route table against the links.

**NS-U-12 [H] Empty, loading and error on every data screen.** Each list, table, chart and detail view has all three. Empty says what the user can do next; loading uses a skeleton or a spinner sized to the content; error says what failed and offers retry. Why: the happy path is the least of real use.

**NS-U-13 [H] No fabricated facts.** Never invent statistics ("10,000+ teams"), testimonials, logos, avatars of people, customer names, ratings, certifications or compliance claims (SOC 2, GDPR, ISO). Use data from the repo, or a placeholder that is clearly one ("Customer name", a grey avatar, "Metric pending") and list every placeholder in the delivery notes. Sample data in a dev fixture is marked as such.

**NS-U-17 [P] No explanation paragraphs on screen.** Do not add text that describes what the screen is for or how a feature works. Use labels, placeholders for format only, tooltips and the empty state. Bad: "This dashboard gives you a comprehensive overview of ...". Good: the title "Orders" and a filter row.

## Delivery

**NS-U-15 [Q] Performance basics.** Images carry width and height or an aspect ratio so nothing shifts; lazy-load only below the fold (never the largest visible image); fonts have a fallback and `font-display: swap`; no layout shift from late-loading banners; no animation on layout properties.

**NS-U-18 [H] Run it and click through.** Before delivery start the app, open each changed screen, click every control, resize to 360 and 1280 wide, switch theme, force the empty and error states, and watch the console. Report what was clicked. "Looks right in code" is not a pass. If it cannot run, say so and mark the result unverified.

**NS-U-20 [Q] List the placeholders.** End the delivery notes with a "Placeholders" list: every stand-in copy, image, number or link, and who supplies the real one.

## Mode and output

During a build: apply the rules as you write, then run the gate. After or detect: read the code and the running screens, then report. Mode comes from the task, not from a question (see the core skill).

Output for a screen or flow: the gate table from `references/checklist.md` (rule id, PASS or FAIL, evidence), the placeholders list, and unresolved conflicts with the repo's rules. A FAIL is fixed or listed with a reason; it is never dropped.

Small edit (one component, one style): check NS-U-05, 10, 12, 13 and 16 only, one line of evidence each.
