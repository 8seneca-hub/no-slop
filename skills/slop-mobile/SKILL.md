---
name: slop-mobile
description: Use when building or reviewing a phone, tablet or narrow-width layout, a native or Expo mobile screen, or a responsive web page. Covers reflow, overflow, safe areas, tap targets, dynamic type, keyboard, gestures, and the phone-versus-desktop split.
allowed-tools: Read Write Edit Glob Grep
---
# slop-mobile

Narrow-screen layout and touch. Load with `slop-ui` for visuals and `slop-a11y` for names, contrast and focus. Tiers: **H** never ship, **P** needs a written reason, **Q** fix when cheap. Findings cite id, location, one line of reason.

## Layout

**NS-M-01 [H] Reflow from phone up.** Build the 360 px layout first, then widen with breakpoints set where the content breaks, not at device names. Desktop is not a stretched phone: use the extra width for columns, side panels or tables.

**NS-M-02 [H] No horizontal overflow.** The page and every screen scroll vertically only (data tables and code blocks may scroll inside their own container). Find causes: fixed `width` in px, `100vw` plus padding, images without `max-width: 100%`, flex children without `min-width: 0`.

**NS-M-03 [H] Safe areas and notches.** Respect the top inset, home indicator and rounded corners: `env(safe-area-inset-*)` on web, `SafeAreaView` or insets hooks in React Native. Why: content under the notch or home bar cannot be read or tapped. Sticky and bottom bars add the bottom inset to their padding.

**NS-M-12 [Q] Long names and long words.** Test a 40 character name, an unbroken 30 character string, an email and a currency value with grouping. Use truncation with a full-value tooltip or detail view for names, wrapping (`overflow-wrap: anywhere`) for free text, and never push an action button out of view.

## Touch

**NS-M-04 [H] Tap targets 44 by 44 pt (iOS) and 48 by 48 dp (Android), with at least 8 spacing.** The hit area may exceed the visible icon (`hitSlop`, padding). Why: thumbs are about 10 mm wide, so small targets cause mistaps. WCAG 2.5.8 sets only a 24 px floor; platform guidance is stricter.

**NS-M-05 [P] Thumb reach.** Primary actions sit in the lower half or in a bottom bar; destructive actions are away from the primary one and ask for confirmation or offer undo. Top-right corner buttons are for secondary actions.

**NS-M-06 [H] No hover-only interaction.** Tooltips, menus and reveals that need hover must also work on tap or long press. Use a visible control for anything important.

**NS-M-07 [H] Gesture alternatives.** Swipe to delete, drag to reorder, pinch, long press and pull each have a visible button or menu equivalent. Why: gestures are hidden, and some users cannot perform them.

## Text and input

**NS-M-08 [H] Dynamic type and 200% text.** Layouts survive the largest system font size and 200% browser zoom: no clipped text, no fixed-height containers around text, no overlapping. Use relative units (`rem`, scaled `sp`). Allow multi-line labels; stack rows that no longer fit.

**NS-M-09 [H] Keyboard avoidance.** A focused input is never hidden by the keyboard; sticky bars move above it or hide. Use the right keyboard type (`inputMode`, `keyboardType`), `autocomplete` and `enterKeyHint`. Test with the keyboard open on a 360 by 640 screen. Bad: a fixed submit bar covering the last field. Good: the form scrolls the field into view and the bar rides above the keyboard.

## Behaviour

**NS-M-10 [P] Orientation.** Do not lock orientation without a reason (a camera or game may). Landscape on phone must not hide the primary action behind the keyboard or bars.

**NS-M-11 [Q] Pull to refresh and back.** Lists that can go stale support pull to refresh and show last updated. System back (Android button, iOS edge swipe, browser back) returns to the previous screen with scroll and filters preserved and never exits unsaved work silently.

**NS-M-13 [H] Loading, offline and slow states.** Use skeletons sized like the content, not a blank screen. Show an offline banner, keep cached data readable, queue or disable writes with a reason, and give a retry on failure. Mark stale data. Never show a spinner with no end.

## Structure

**NS-M-14 [P] Bottom bar or tabs, not both for the same job.** 3 to 5 destinations in one bottom tab bar, labelled with text and icon. Do not stack a bottom tab bar, a floating action button and a sticky CTA. A hamburger hides the main navigation and is for secondary destinations only.

**NS-M-15 [P] One primary action per screen.** One visually dominant button; others are secondary or in a menu. Why: two equal calls to action leave the user guessing.

**NS-M-16 [Q] Native controls over custom ones.** Use the platform date picker, select, switch, share sheet and haptics before building your own. A custom control needs the same keyboard, screen reader and focus behaviour as the native one.

## Phone product shape

**NS-M-17 [P] Phone is for quick view and quick action.** Show what the user needs at a glance (status, count, next step) and one fast action (approve, check in, reply). Heavy work (bulk edit, wide tables, report building, configuration) goes to desktop. On the phone, show a plain card: the title "Open on desktop", a one-line reason ("Editing the schedule needs a wide screen") and a button that sends the link. Do not squeeze a desktop table into a phone, and do not hide the feature without saying so.

## Test before delivery

**NS-M-18 [H] Test at 360 by 640, 390 by 844 and a tablet width (768 or 820).** At each: no horizontal scroll, nothing cut by safe areas, targets sized, long data fine, largest text size fine, keyboard open fine, light and dark. Use the emulator, a device or a browser at those sizes, and report what was run. If you could not run it, mark it unverified.

## Gate (phone and narrow)

Answer each with evidence. Hard: NS-M-01, 02, 03, 04, 06, 07, 08, 09, 13, 18 all pass. Purpose: 05, 10, 14, 15, 17 pass or carry a reason. Quality: 11, 12, 16 fixed or listed. Output as a table: id, PASS or FAIL, evidence (size tested, command, screenshot).
