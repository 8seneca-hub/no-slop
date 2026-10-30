# UI Delivery Gate

Answer every line with evidence (file and line, command run, screenshot name). Hard items must all be **no**. Purpose items need a written reason when **yes**. Quality items: fix when cheap, list when not.

Small gate (one component or one style change): NS-U-05, 10, 12, 13, 16.

## Hard (any yes is a FAIL)

| Id | Question | Evidence |
|---|---|---|
| NS-U-01 | Did I build without reading DESIGN.md, the kit or the tokens that exist? | |
| NS-U-02 | Is there no direction and the result not labelled "draft without direction", or an invented brand name, logo or palette story? | |
| NS-U-05 | Is any colour, size, radius or shadow a raw value instead of a token? | grep `#[0-9a-f]{3,8}`, `rgb(`, `px` in changed files |
| NS-U-10 | Does any button, menu item, tab, toggle or form do nothing and look enabled? | list of controls clicked |
| NS-U-11 | Does any link or nav item point to a page that does not exist? | routes vs links |
| NS-U-12 | Does any data screen lack an empty, loading or error state? | each state shown |
| NS-U-13 | Is there an invented statistic, testimonial, logo, avatar, customer name, rating or compliance claim? | grep results |
| NS-U-14 | Does the screen break in light or dark when the repo supports both (unreadable, invisible, wrong colour)? | both screenshots, contrast-check output |
| NS-U-18 | Was the app not run and clicked through, with that not stated as unverified? | what was run, viewports |

## Purpose (yes needs one written line)

| Id | Question | Reason or no |
|---|---|---|
| NS-U-03 | Any gradient, blur, glow, blob, grid backdrop or heavy shadow? Is each tied to hierarchy or brand, and 2 or fewer on screen? | |
| NS-U-04 | Any colour used for something other than its meaning? More than neutral + 2 cores + 1 accent? | |
| NS-U-09 | Any animation without a cause? Is reduced motion handled? | |
| NS-U-16 | Any local component that duplicates a kit component? Any missing pattern built locally instead of added to the kit? | |
| NS-U-17 | Any paragraph on screen that explains the screen or feature? | |
| NS-U-19 | Card-everything, equal three-column grid, stock hero, closing CTA band, centred everything? | |

## Quality (fix when cheap)

| Id | Question | Evidence |
|---|---|---|
| NS-U-06 | One icon set, no emoji icons, labels beside icons? | |
| NS-U-07 | Radius and spacing from the scale only? | |
| NS-U-08 | Type sizes from the scale, body measure 45 to 75 characters? | |
| NS-U-15 | Images sized, lazy only below the fold, no layout shift, fonts with fallback? | |
| NS-U-20 | Placeholders listed with who supplies the real content? | |

## Output

```
| Id | Result | Evidence |
|---|---|---|
| NS-U-10 | PASS | 14 controls clicked in Chromium at 1280 and 360; Export is disabled with title "Select rows first" |
```

Then: placeholders list, conflicts with repo rules, anything unverified and why.
