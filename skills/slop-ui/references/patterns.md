# UI slop catalogue

Each entry: how to recognise it, why it fails, the fix, the rule. Search hints are for Grep.

## Decoration

| Pattern | Recognise | Fix | Rule |
|---|---|---|---|
| Default gradient | `linear-gradient` blue to purple or cyan, on hero, buttons, text (`background-clip: text`) | Flat token colour; keep a gradient only where it separates levels, with the reason written | NS-U-03 |
| Glassmorphism | `backdrop-filter: blur` on nav, cards and modals together | Solid surfaces; blur on at most one overlay | NS-U-03 |
| Glow | `box-shadow` with a coloured, large-radius, zero-offset value; `drop-shadow` on icons | Matte; one focus ring that follows the focus token | NS-U-03 |
| Blobs and orbs | Absolutely positioned blurred circles behind content, `filter: blur(80px)` | Delete | NS-U-03 |
| Grid or dot backdrop | Repeating thin lines or dots as page background | Plain surface unless it is a real brand motif | NS-U-03 |
| Shadow on everything | Same large soft shadow on every card, input and button | Flat by default; shadow marks elevation (menus, dialogs) | NS-U-03 |
| Pill everything | `border-radius: 9999px` on inputs, cards, badges and buttons | Radius from the scale; one larger radius for one purpose | NS-U-07 |
| Rainbow palette | 5 or more hues on one screen with no role | Neutral base, one or two cores, one accent, status colours by meaning | NS-U-04 |
| Accent everywhere | Accent on buttons, icons, links, badges, borders and backgrounds | Accent only on the main action and selection | NS-U-04 |
| Forced dark | Dark theme with no light and no stated reason | Follow the repo; offer both when the kit does | NS-U-14 |

## Layout

| Pattern | Recognise | Fix | Rule |
|---|---|---|---|
| Card-everything | Every block is a rounded, shadowed card, cards inside cards | Use rows, tables, dividers and whitespace; card only for independent, movable units | NS-U-19 |
| Equal three-column features | Three same-size columns, icon, bold title, one sentence | Order by importance; use a list or a table; vary by content | NS-U-19 |
| Stock hero | Big headline, subline, two buttons, abstract or stock image | Lead with the product's own screen, data or task | NS-U-19 |
| Centre-everything | All text centred, including long paragraphs | Left align text; centre only short titles and empty states | NS-U-08 |
| Closing CTA band | "Ready to get started?" strip on every page | Remove; the action is already in the page | NS-U-19 |
| Emoji icons | Emoji in buttons, headings, list bullets, nav | The kit's icon set, with labels | NS-U-06 |
| Mixed icon sets | Outline and filled icons, two libraries, mixed sizes | One set, one stroke, one size scale | NS-U-06 |
| Magic numbers | `margin: 13px`, `font-size: 15.5px`, three near-identical greys | Scale tokens | NS-U-05, 07 |
| Wall of text | Lines over 80 characters, no line-height set | Max-width in `ch`, line height 1.4 to 1.6 | NS-U-08 |

## Behaviour

| Pattern | Recognise | Fix | Rule |
|---|---|---|---|
| Dead button | `onClick={() => {}}`, `onClick={noop}`, `console.log` only, `TODO` | Implement, or `disabled` with a reason | NS-U-10 |
| Dead link | `href="#"`, `href=""`, `javascript:void(0)`, route not in the router | Real route or remove | NS-U-10, 11 |
| Ghost nav | Nav items for pages that were never built | Remove until built; grep routes against links | NS-U-11 |
| Fake submit | Form that toasts "Saved!" without a request | Send the request, show real result and error | NS-U-10 |
| Missing states | Table with no empty branch; no `isLoading`, no `error` branch | Add all three states | NS-U-12 |
| Infinite spinner | Spinner with no timeout or error path | Error state with retry after failure or timeout | NS-U-12 |
| Fake stats | "10k+ users", "99.9% uptime", "4.9 stars", "Trusted by" | Real data or marked placeholder | NS-U-13 |
| Fake people | "Sarah J., CEO", pravatar or randomuser images, quotes | Remove or a labelled placeholder | NS-U-13 |
| Fake logos | Row of well-known company logos | Remove; use real customers with permission | NS-U-13 |
| Fake compliance | "SOC 2 certified", "bank-grade security", GDPR badge | Only with a source in the repo | NS-U-13 |
| Lorem ipsum | `Lorem`, `ipsum`, "John Doe", "Acme Inc" in shipped screens | Real text or labelled placeholder, listed | NS-U-13, 20 |
| Explainer paragraph | Sentence under a title that restates what the page does | Delete; use label or tooltip | NS-U-17 |
| Decorative motion | Entrance animation on every block, looping pulse, parallax | Motion only for cause and effect; reduced-motion fallback | NS-U-09 |
| Layout shift | `<img>` with no size, banner injected above content | Dimensions or aspect-ratio; reserve space | NS-U-15 |
| Eager everything | `loading="lazy"` missing below the fold, or present on the hero image | Lazy only below the fold | NS-U-15 |
| Local clone | A new `.btn-primary` next to the kit's Button | Use the kit, or add the variant to the kit | NS-U-16 |

## Sterile default (the opposite failure)

Flat white, thin grey borders, system font, no identity. This is not slop but a missing direction. Do not fix it with more rules. Ask for `DESIGN.md`, or label the result a draft (NS-U-02). Never fix it by inventing a brand.

## Telling craft from default

Ask one question: what does this element tell the user? If the answer is "nothing, it looks modern", it is decoration. If a token, a kit component or the brief explains it, it is a decision.
