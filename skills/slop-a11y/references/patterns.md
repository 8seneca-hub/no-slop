# Accessible patterns

Prefer the native element. These patterns apply when you must build a custom one. Roles and keys follow the WAI-ARIA Authoring Practices.

## Dialog

- Prefer `<dialog>` with `showModal()`: it traps focus, makes the page inert and closes on Escape.
- Custom: `role="dialog"`, `aria-modal="true"`, `aria-labelledby` pointing at the title.
- On open, move focus to the first field or the title (the least destructive control for a confirm). On close, return focus to the trigger.
- Escape closes. A close button has a name ("Close"). Do not close on backdrop click when the form has unsaved data.
- Bad: a styled `div` that opens and lets Tab walk into the page behind.

## Menu button

- Trigger: `<button aria-haspopup="menu" aria-expanded="false" aria-controls="id">`.
- Menu: `role="menu"`, items `role="menuitem"` (`menuitemcheckbox` and `menuitemradio` for toggles).
- Enter, Space or ArrowDown opens and focuses the first item. ArrowUp and ArrowDown move, Home and End jump, a typed letter jumps. Escape closes and returns focus to the trigger. Tab closes.
- Navigation menus are not `role="menu"`: use a `nav` with a list of links, optionally disclosure buttons.

## Tabs

- `role="tablist"` with `role="tab"` children, `aria-selected`, `aria-controls`; panels `role="tabpanel"` with `aria-labelledby`.
- One tab stop: the selected tab has `tabindex="0"`, others `-1`. ArrowLeft and ArrowRight move (and activate, or activate with Enter when panels load slowly). Home and End jump. Tab moves into the panel.

## Combobox (autocomplete)

- Input `role="combobox"`, `aria-expanded`, `aria-controls` (the listbox), `aria-autocomplete="list"`, and `aria-activedescendant` for the highlighted option.
- Focus stays in the input. ArrowDown opens and moves, Enter selects, Escape closes (second Escape clears). Options `role="option"` with `aria-selected`.
- Announce result count in a polite live region ("5 results"). Show a visible no-results message.

## Toast and status message

- Container exists on load: `role="status"` (polite) for success, `role="alert"` for errors that need action.
- Do not move focus. Leave it long enough to read (5 s minimum, longer for longer text), pause on hover and focus, and provide a close button.
- Never put the only copy of an error in a toast. Show it on the field or page too.
- Under reduced motion, appear without sliding.

## Data table

- Real `<table>` with `<caption>` or `aria-labelledby`, `<th scope="col">` and `scope="row"`.
- Sortable column: a `<button>` inside the `th` and `aria-sort="ascending|descending"` on the `th`.
- Row actions have names that include the row ("Delete invoice 1042"). Selection checkboxes have labels. Announce sort and filter results in a live region.
- On narrow screens either scroll the table in a labelled, focusable container (`tabindex="0"`, `role="region"`, `aria-label`) or restructure to a list. Do not drop columns silently.
- Use `role="grid"` only for editable, cell-navigation tables.

## Form errors

```html
<label for="email">Email</label>
<input id="email" type="email" autocomplete="email" required
       aria-invalid="true" aria-describedby="email-err">
<p id="email-err">Enter an email address like name@company.com.</p>
```

- Validate on submit and on blur after the first attempt, not on every keystroke.
- On a failed submit, put a summary at the top with `role="alert"` or move focus to it; each item links to its field. Or focus the first invalid field.
- Error text says what is wrong and how to fix it, and includes an icon or the word "Error" (not colour alone).
- Required: say it in the label ("Email (required)") and set `required`. Keep the user's input after an error.

## Disclosure, accordion

- `<button aria-expanded="false" aria-controls="panel">`; toggle with Enter and Space. Use `<details>` when it fits.

## Skip link and landmarks

- First focusable element: `<a href="#main">Skip to content</a>`, visible on focus. `<main id="main" tabindex="-1">`.
- One `main`; `nav` with `aria-label` when there are two.

## Single-page route changes

- After a route change, move focus to the new `h1` (or `main`) and update `document.title`. Announce loading states in a status region.
