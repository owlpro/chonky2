# Touch interactions on phones and tablets

**Status:** open
**Estimate:** 2–3 days

## Goal

Phase 1 shipped in 7.2.0: the sidebar drawer, tap to open, long press for the context menu, the "More" toolbar menu, touch-sized targets and hover only with a mouse. What is left are the interactions that still need a mouse or a keyboard.

## Problems

1. **Multi-select needs Ctrl or Shift.** A touch screen has neither, so only one file can be selected (with a long press).
2. **Drag and drop does not work on touch.** `FileBrowser` only uses `HTML5Backend`. On Android Chrome a long press on a draggable file may also start a native drag, which has not been tested next to the long-press context menu.

## Proposed work

- [ ] **Selection mode:** a long press enters selection mode (or it becomes a context menu action). In selection mode, a tap toggles a file and a bar shows the count, Select all and Cancel. The tap-to-open in `useClickHandler` (`src/components/internal/ClickableWrapper-hooks.tsx`) has to toggle instead while the mode is on.
- [ ] **Drag and drop on touch:** either add `TouchBackend` (or `react-dnd-multi-backend`) for touch devices, or turn DnD off on touch and rely on Move/Copy actions in the context menu. Decide which one first.

## Notes

- The long press lives in `useContextMenuTrigger` (`src/components/external/FileContextMenu-hooks.ts`); selection mode should start from the same timer rather than a second one.
- Narrow layout is `NARROW_LAYOUT_WIDTH` (560px) in `src/util/styles.ts`, provided by `ChonkyNarrowLayoutContext`; touch is `useIsCoarsePointer()`.
- Phase 1 was only tested in Chrome's mobile emulation. Test on a real iOS Safari and Android Chrome device, together with this work.
