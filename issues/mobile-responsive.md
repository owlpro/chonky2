# Make the file browser usable on phones

**Status:** phase 1 done, phase 2 open
**Estimate:** 4–6 days in total (layout only: 1–2 days)

## Goal

The browser should look clean and be comfortable to use on a phone (≈360–480px wide, touch input). Today the layout shrinks somewhat, but most interactions still assume a mouse and keyboard.

## What already exists

- A mobile breakpoint at 480px that lowers font size and control height (`src/styles/chonky.css`, `@media (max-width: 480px)`).
- `useIsMobileBreakpoint()` in `src/util/styles.ts`. `GridContainer` uses it to change the column count and gutter.
- List view hides the Type and Date columns below 600px.
- The sidebar is hidden when the `chonky` container is narrower than 560px (`@container chonky (max-width: 560px)`).
- The toolbar wraps onto several lines when space runs out.

## Problems

1. **The sidebar cannot be reached.** Below 560px it gets `display: none`, and nothing else opens it.
2. **Opening files needs a double tap.** `useClickHandler` (`src/components/internal/ClickableWrapper-hooks.tsx`) turns a single click into selection and a double click into opening. On touch, people expect one tap to open.
3. **No context menu on iOS.** The menu opens on `contextmenu`, and iOS Safari does not fire that event for a long press.
4. **Drag and drop does not work on touch.** `FileBrowser` only uses `HTML5Backend`.
5. **Multi-select needs Ctrl or Shift.** A touch screen has neither.
6. **Some controls only appear on hover.** For example, the sidebar item remove button (`.chonky-sidebarRemovableItem:hover > .chonky-sidebarItemRemove`). On touch, hover styles also get stuck after a tap.
7. **The toolbar and navbar get crowded.** On narrow widths the menu bar, buttons, search and breadcrumbs wrap into several rows and take up too much vertical space.
8. **Tap targets are small.** At the 480px breakpoint, `--chonky-control-height` is 30px, below the usual ~40–44px minimum for touch.

## Proposed work

### Phase 1: layout and core touch behaviour (priority)

- [x] **Sidebar drawer:** on narrow containers, render the sidebar as an overlay drawer instead of hiding it. Add a toggle button to the navbar or toolbar. Close the drawer on backdrop tap, on Escape, and after choosing an item.
- [x] **Tap to open:** when the input is touch (`pointerType === 'touch'` or `(pointer: coarse)`), a single tap opens the file. Keep the current behaviour for mouse.
- [x] **Long press:** a long press of about 500ms on a file opens the context menu and selects the file. Cancel it if the finger moves.
- [x] **Hover-only UI:** wrap `:hover` styles in `@media (hover: hover)`. Keep hover-only controls (such as the sidebar item remove button) always visible when `(hover: none)`.
- [x] **Compact toolbar:** below the mobile breakpoint, keep search and the most important buttons visible and move the rest into an overflow ("⋯") menu. Let the breadcrumbs scroll horizontally or collapse the middle folders.
- [x] **Tap targets:** raise the control and row height for `(pointer: coarse)` rather than lowering them.

### Phase 2: advanced touch interactions

- [ ] **Selection mode:** a long press enters selection mode (or it becomes a context menu action). In selection mode, a tap toggles a file and a bar shows the count, Select all and Cancel.
- [ ] **Drag and drop on touch:** either add `TouchBackend` (or `react-dnd-multi-backend`) for touch devices, or turn DnD off on touch and rely on Move/Copy actions in the context menu. Decide which one first.

## Notes

- Base layout decisions on the container width (`@container chonky`), not only on the viewport. The browser is often embedded in a smaller panel.
- `useIsMobileBreakpoint` currently checks the viewport. Consider a container-based hook, or keep the logic in CSS where possible.
- Test on a real iOS Safari and Android Chrome device, not only in desktop devtools emulation. Long press, `contextmenu` and hover behave differently there.
- These changes reach npm, so each one needs a CHANGELOG entry. Changing tap-to-open on touch alters existing behaviour: consider putting it behind an option, or call it out clearly under `Changed`.
