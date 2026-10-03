# Changelog

All notable changes to `chonky2` are listed here, grouped by released version.
The project follows [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Development

- Playground: a "Many files" folder with 64 files, a long name every ninth, for trying scrolling and selecting many.

## [7.6.0]

### Changed

- The list view cuts long names in the middle too, like the phone list since 7.4.1: the start and the end with the extension stay (`HANISTAR X20_V1.0.3_firmware_up… 11092026.rar`), in both directions.

## [7.5.2]

### Fixed

- The grid view could scroll sideways by a few pixels when the app's CSS gives the file list a full-width scrollbar instead of Chonky's thin one: the grid made room for a thin one. It now measures the scrollbar it really has, rounds column widths down to whole pixels, and never scrolls sideways.

## [7.5.1]

### Fixed

- A long press on a file no longer flashes the dragging look first: Chrome on Android turns a long press into a native drag. Files now only drag when the pointer that started it is a mouse or a pen, not a finger.

## [7.5.0]

### Added

- Selection mode while Chonky is narrow: a long press on a file selects it and shows a round checkbox on every row, which moves the rows over. A tap then adds a file to the selection or takes it out instead of opening it. The navbar turns into an "All" checkbox, which selects every file in the list or none, and a Cancel button; the status bar into the number of selected files and icon buttons for the context menu's actions on them (Cut, Copy, Download and Delete first, the rest in a "More" menu). Running one, Cancel, opening another folder or taking the last file out of the selection ends selection mode. A long press on empty space still opens the context menu, and wider Chonkys keep the context menu for files too.
- `ChonkyIconName.checked`, `unchecked` and `checkedSome` for the checkboxes, and the `chonky.toolbar.selectAll`, `chonky.toolbar.cancelSelection` and `chonky.toolbar.selectionModeCount` messages.

### Changed

- While Chonky is narrow, list rows are 2px apart, so the highlights of selected rows don't run into each other.

## [7.4.5]

### Fixed

- With `dir="rtl"` the status bar's counts stay in order (`7 items`, not `items 7`).

## [7.4.4]

### Fixed

- The click a browser sends after a long press reached the file under the finger: `ClickAwayListener` replaced the root's `onClickCapture`, which swallows it, with its own. It now calls both.

### Development

- Playground: a Refresh button next to Close in `toolbarEnd`.
- Playground: a "Long names" folder, whose names are cut in the middle on a phone.
- Playground: a "Full screen" control that shows Chonky over the whole page like a modal; its ✕ button closes it.

## [7.4.3]

### Fixed

- After a long press opens the context menu on a phone, lifting the finger no longer selects the text of the menu item under it: the menu, which lives outside Chonky's root, now has `user-select: none` too.

## [7.4.2]

### Fixed

- With `dir="rtl"` the list view's rows are right-to-left like its headings; react-window set them to `direction: ltr`. Sizes, dates and times stay in order there (`3.02 MB`, not `MB 3.02`).

## [7.4.1]

### Fixed

- While Chonky is narrow, a long name loses its middle instead of its end, so its start and its end with the extension stay (`HANISTAR X20_V…11092026.rar`). It is cut after a space, dash, dot or underscore near the end when there is one, so joined letters, e.g. Persian, stay joined. Names are in a `dir="auto"` span, so a Latin name in a right-to-left Chonky, and the other way round, keeps its order.

## [7.4.0]

### Changed

- While Chonky is narrow, the list is the only view: the view buttons are left out, and the chosen view comes back when Chonky is wider. Its rows are 72px tall like a phone's file manager: a 48px thumbnail or icon, the name, and the date and size (or item count) on a second line, with a line between rows from the text on. There are no column headings; sorting is in the Options menu.
- While Chonky is narrow, the file list reaches the edges of Chonky and its scrollbar lies over the rows at the edge, instead of in a gutter of its own.

## [7.3.0]

### Added

- `groupIcons` prop and `setChonkyDefaults` option, typed `ChonkyGroupIcons`: icons for the toolbar's group menus by group name, e.g. `{ Share: ChonkyIconName.share }`. Each is a `ChonkyIconName`, an icon name the `iconComponent` knows, or any element.
- `ChonkyIconName.actionsMenu` (lightning bolt) and `ChonkyIconName.optionsMenu` (sliders), the icons of the "Actions" and "Options" menus unless `groupIcons` sets others, and `ChonkyIconName.toolbarGroup` for other groups without an icon.

### Changed

- While Chonky is narrow (560px or less), the group menus show only their icon, with the group name as the tooltip and `aria-label`, and the toolbar stays on one row: the menu bar at the start, the buttons at the end. If the row is still too long, the menu bar gives up room instead of the toolbar wrapping. Wider toolbars look as before.
- Icon-only `ToolbarButton`s get their `text` as `aria-label`.

### Fixed

- With `dir="rtl"` the toolbar buttons sit at the end of the row (`margin-inline-start: auto` instead of `margin-left: auto`), not next to the menus.

### Development

- `CLAUDE.md`: every commit that changes published code bumps the version and writes its changelog entries under that version.
- `issues/mobile-responsive.md` lists only what is left after 7.2.0: multi-select and drag and drop on touch screens.
- README: new light and dark previews with Favorites and Recent, and a preview on a phone.
- `size-limit` raised from 66 kB to 68 kB, for the phone layout of the list.

## [7.2.0]

### Added

- Phones and tablets: when Chonky is 560px wide or narrower, the `FileSidebar` becomes a drawer over the file list and the status bar. A menu button in the navbar, in place of Forward, opens it; a tap outside it, Esc or choosing an item closes it.
- A long press on a touch screen opens the context menu, also on iOS, which never sends `contextmenu`. The file under the finger is selected like on a right click, and lifting the finger doesn't open it.
- While Chonky is narrow, the toolbar buttons other than the view modes go into a "More" (⋯) menu, so the toolbar fits on one line. At 480px or narrower the search field is an icon that covers the address bar while it has focus or text.
- `ChonkyIconName.sidebar` and `ChonkyIconName.more`, the `chonky.toolbar.toggleSidebar` and `chonky.toolbar.moreActions` messages, and the `--chonky-status-bar-height` CSS variable.

### Changed

- On touch screens a tap opens a file or folder, like a double click with the mouse, instead of selecting it. Mouse clicks work as before.
- On touch screens (`pointer: coarse`) buttons are 40px tall, list rows at least 44px, and the ✕ buttons of Favorites and Recent are larger and always shown. The search and rename fields use 16px text there, so iOS doesn't zoom in on them.
- Hover effects only apply on devices that can hover, so they no longer stick after a tap.
- The list view drops columns by its own width instead of the window's: the Type column at 680px or narrower, then the Date column at 480px. Next to the sidebar on a tablet the names stay visible.
- Sidebar items' icons sit under the icons of the section titles, and the Favorites drop hint is smaller and has no star of its own.

### Fixed

- On narrow screens the list view's Type and Date columns stayed visible and pushed the size and date under the name.

### Development

- `issues/mobile-responsive.md`: the plan for making the file browser usable on phones.
- Website: the homepage animation's grid entries now match the package's grid view (sizes, icons, hover and selected states), and the cursor double-clicks to open the folder.
- Website: the homepage animation follows the current sidebar (Favorites, Recent, Folders). Its sections fade in, a photo is opened into Recent, a folder is dragged onto Favorites, then the up button zooms back to Home and both entries are removed with ✕, so the loop restarts where it began. The timeline runs on the Web Animations API.
- `wrangler.jsonc`: an empty `previews` block, so Cloudflare's preview builds for branches other than `main` (`wrangler preview`) no longer fail.

## [7.1.0]

### Added

- User state: favorites and collapsed sidebar sections are remembered per user (`ChonkyUserState`). Pass `userStateStorageKey` to keep them in `localStorage`, or `userState` with `onUserStateChange` to keep them in the app, e.g. on its server. `onUserStateChange` is called on every change in both cases.
- `FileSidebarFavorites`: a sidebar section with the user's favorite folders. Folders dropped onto it or its title are added (a collapsed section then opens), and the star in its title turns yellow while a drop would add them. Favorites are reordered by dragging and removed with their ✕ button. Without favorites it shows a "Drop folders here" box, also when collapsed while a folder is dragged. Favorites are updated when their folder shows up in `files` or `folderChain` with a new name.
- `ChonkyActions.AddToFavorites` and `ChonkyActions.RemoveFromFavorites` (opt-in, toolbar `Actions` menu and context menu) for the selected folders. Each is hidden when it doesn't apply to them.
- Collapsible sidebar sections, like VS Code's side bar: clicking a `FileSidebarSection`'s title collapses it to its title. Sections keep their order: a collapsed section stays at the top when no open section comes before it, otherwise it goes to the bottom. Its new `id` prop (defaulting to a string `title`) remembers it in the user state, and `collapsible={false}` keeps it open.
- `disableAnimations` prop (also for `setChonkyDefaults`): turns off menu fade-ins, transitions and the sidebar animations. Loading indicators keep moving. Animations are also off when the system asks for reduced motion (`prefers-reduced-motion`).
- Collapsing or opening a sidebar section slides the sections to their new places, and its arrow turns. Only the user's clicks animate, not the saved state loading.
- `FileSidebarRecent`: a sidebar section with the files the user opened last (`OpenFiles`), newest first, kept in the user state (`ChonkyUserState.recent`). Folders aren't listed. Clicking one opens it again and its ✕ button removes it; `limit` sets how many are kept (default 10). Opened files are only recorded while the section is shown, and renamed files are updated like favorites.
- `ChonkyIconName.recent`, and the `chonky.sidebar.recent`, `chonky.sidebar.recentEmpty` and `chonky.sidebar.removeRecent` messages.
- `icon` prop on `FileSidebarSection` and `FileSidebarFavorites`: an icon before the section title. Favorites show a star by default.
- `ChonkyIconName.favorite`, `ChonkyIconName.unfavorite` and `ChonkyIconName.sectionToggle`, and the `chonky.sidebar.favorites`, `chonky.sidebar.favoritesDropHint` and `chonky.sidebar.removeFavorite` messages.

### Changed

- The active sidebar item shows an accent dot at its end instead of a bar at its start, and sidebar items sit deeper than the section titles, like a tree.
- Clicking a list column heading a third time removes the sort, so files show in the order of `files` (ascending, descending, unsorted). The toolbar's sort options cycle the same way.
- The list view shows the modification time in 24-hour format (`09:12`), in its own column at the end of the date cell, with digits of equal width so dates and times line up from row to row. It comes from the new `formatFileModTime` formatter, and `formatFileModDate` now returns only the date. An app that passes its own `formatFileModDate` without `formatFileModTime` gets no separate time.
- Files are no longer drop targets, so they don't turn red while something is dragged over them. Files from the computer dropped on a file still go to the current folder.
- Open sidebar sections share the sidebar's height, none growing past its content, and each one scrolls on its own; the sidebar as a whole no longer scrolls. Section titles are buttons with an arrow.

### Fixed

- A drop zone that holds folders (the file browser for files from the computer, the file list) no longer lights up for an instant while the pointer crosses the gap between two folders.
- Dragging a file that isn't selected while other files are selected moved the selected files instead of the dragged one.
- Saved favorites and collapsed sections showed up only after the first render, so sections opened and then collapsed on page load with their arrows turning. The user state is now read before the first render; `useChonkyStore` takes it as a new optional argument.

### Development

- Playground: a Disable animations switch.
- Playground: a Recent section in the sidebar.
- Playground: the sidebar has a Favorites and a Folders section, `AddToFavorites` and `RemoveFromFavorites` are registered, and a User switch shows the user state kept per user in `localStorage`.

## [7.0.0]

### Breaking

- Chonky no longer uses Material UI, Emotion, styled-components or JSS. The only peer dependencies are now `react` and `react-dom`; `@mui/material`, `@mui/styled-engine-sc`, `@emotion/react`, `@emotion/styled` and `styled-components` can be uninstalled if the app doesn't use them itself. Together with the dependency changes below, Chonky's cost in an app bundle drops from about 139 KB to 55 KB (minified + brotli, all dependencies included).
- New Fluent (Windows 11 File Explorer) look. Styles are plain CSS injected once into `<head>`, and theme values are CSS variables on `.chonky-theme` (see `src/styles/chonky.css`). Overrides written against MUI's theme, MUI class names (`.MuiButton-root`, …) or the old `chonky-*` class names no longer apply.
- New layout: `FileToolbar` shows one menu per action group, then the ungrouped action buttons, then the view mode buttons after a divider. The current folder's name is only shown in the breadcrumb. `CreateFolder` and `UploadFiles` are icon-only buttons. The search field moved into `FileNavbar`, and the item count moved to the new `FileStatusBar`. Apps that render `FileToolbar` without `FileNavbar` no longer get a search field. `FullFileBrowser` now renders toolbar, navbar, list, status bar in that order.
- Default entry sizes changed: list rows are 34px (was 30px), grid tiles are 140×140 (was 165×130) and compact entries 240×52 (was 220×40).
- `react-intl` is no longer used; Chonky formats messages itself with the browser's `Intl` APIs. `i18n` accepts `locale`, `defaultLocale`, `messages`, `timeZone` and `formatters`; other `react-intl` options (`formats`, `textComponent`, `onError`, …) are ignored. Messages support `{arg}`, `plural`, `selectordinal`, `select`, `#`, `number`/`date`/`time` arguments and apostrophe quoting, but not rich-text tags such as `<b>…</b>`. Custom `formatters` receive a `ChonkyIntl` object instead of `react-intl`'s `IntlShape`; it has the same `formatMessage`, `formatDate`, `formatTime` and `formatNumber` methods, so most formatters only need a type change.
- The CommonJS build is now `dist/index.cjs` (was `dist/index.cjs.js`). Deep imports of that file need updating; `require('chonky2')` is unaffected.
- Removed the unused `reduxActions.setHiddenFileIds` and `reduxActions.setSortedFileIds`, `selectors.getSearcher`, and the `sortedFileIds`, `hiddenFileIdMap` and `searchMode` state fields. `selectHiddenFileIdMap` now returns the files hidden by the search or the hidden-files option (it was always empty).

### Added

- Back and Forward navigation: `ChonkyActions.GoBack` and `ChonkyActions.GoForward` (Alt+Left and Alt+Right) reopen previously visited folders by requesting `OpenFiles`, so apps need no extra code.
- `FileStatusBar` component.
- List view column headings (Name, Type, Size, Date modified). Clicking one sorts by it, clicking it again reverses the order.
- Type column, formatted by the new `formatFileType` formatter (`Folder`, `PDF File`, …). Folders with `childrenCount` show an item count in the Size column.
- Colour-coded file icons: a folder, or a page labelled with the file's extension, in a colour per file type. They are used unless the app sets `iconComponent` or a file sets `icon`. Grid tiles show `thumbnailUrl` images.
- `ChonkyIconName.goBack` and `ChonkyIconName.goForward`.
- `ChonkyActions.DropFiles`: when registered, files dragged in from the user's computer can be dropped anywhere on Chonky. The payload has the dropped `files` and the `destination` folder: the current folder, or the folder entry or breadcrumb they were dropped on. The `DropFilesPayload` type is exported.
- Inline rename: `ChonkyActions.RenameFile` (F2, toolbar and context menu) turns the selected file's name into a text field, with the name before the extension selected. Enter or clicking elsewhere confirms, Escape cancels, and a changed name is dispatched as the new `ChonkyActions.ChangeFileName` (`payload.file`, `payload.name`). Files with `renamable: false` can't be renamed (`FileHelper.isRenamable`).
- After `CreateFolder`, the first folder that shows up in the current folder is selected and put into rename mode with its whole name selected.
- Copy, cut and paste: `CopyFiles` (Ctrl+C) now also puts the files on Chonky's clipboard, the new `ChonkyActions.CutFiles` (Ctrl+X) does the same for moving and shows the files faded, and the new `ChonkyActions.PasteFiles` (Ctrl+V) pastes into the current folder or the folder its context menu was opened on. Copies are dispatched as the new `ChonkyActions.CopyFilesTo`, cut files as `MoveFiles`. The shortcuts also work with Cmd on macOS.
- Files that show up in the current folder after `UploadFiles`, `DropFiles` or `PasteFiles` are selected, and the file list scrolls to them.
- `FullFileBrowser` props `toolbarStart` and `toolbarEnd`, and `FileToolbar` props `startContent` and `endContent`, for the app's own toolbar elements. `ToolbarButton` is exported to build them, and its `icon` can be any element.
- `useFolderDropTarget(folder)` makes an element outside Chonky, such as a sidebar entry, a drop target for files dragged from Chonky; drops arrive as `MoveFiles`. It needs a shared react-dnd context (`disableDragAndDropProvider`).
- `ChonkyIconName` is exported as a value (it was type-only), with new `rename`, `cut` and `close` icons. The `ChangeFileNamePayload`, `CopyFilesToPayload` and `MoveFilesPayload` types are exported.
- `searchText` file field: extra text the search field matches besides the name, e.g. a media ID or URL.
- `ChonkyActions.ChangeSearch` is dispatched when the search text changes, with the trimmed text in `payload.searchString`, so apps can search outside the current folder. The `ChangeSearchPayload` type is exported.
- `FileBrowserHandle.revealFiles(fileIds, select = true)` scrolls to files and selects them. Files that aren't listed yet are revealed when they show up, so an app can call it while it opens their folder; the request is dropped if the folder finishes loading without them.
- Enter in the search field searches right away instead of waiting for the typing pause.
- A clear (✕) button in the search field, shown while it has text. Its label is the `chonky.toolbar.clearSearch` message.
- Sidebar: `FullFileBrowser`'s new `sidebar` prop shows a navigation pane left of the file list, built from the new `FileSidebar`, `FileSidebarSection` and `FileSidebarItem` components. An item opens its `folder` with `OpenFiles`, takes files dragged from the list (`MoveFiles`) or from the computer (`DropFiles`), and is highlighted while its folder is the current folder or an ancestor. The pane hides when Chonky is narrower than 560px; its width is `--chonky-sidebar-width`.
- `loading` prop: a progress bar runs along the top of the file list, and an empty list shows a spinner and the new `chonky.fileList.loading` message ("Loading…") instead of "Nothing to show".
- Thumbnails pulse while their image loads, and show a broken image icon when it fails to load (they stayed blank).
- `ChonkyIconName.home`, `ChonkyIconName.refresh` and `ChonkyIconName.imageBroken`.
- Select all also works with Cmd+A on macOS.
- The mouse's back and forward buttons run `GoBack` and `GoForward` over Chonky, instead of making the browser leave the page.
- After going up to a parent folder (Back, Up or a breadcrumb), the folder the user came out of is selected and scrolled to once it is listed, like in File Explorer.
- CSS variables `--chonky-menu-z-index` (default `2000`) and `--chonky-scrollbar-thumb`.

### Changed

- The package description and keywords say what Chonky is (a file explorer component for React) instead of "A File Browser component for React".

- Menus (toolbar dropdowns and the context menu) are Chonky's own component: they render in a portal, stay inside the viewport, close on outside click, Escape, scroll or resize, and support arrow-key, Home and End navigation.
- File sizes use `KB` for kilobytes everywhere (bigger files showed `kB`).
- Enabled options in menus show a check mark instead of a toggle icon, and the Up button shows an arrow.
- Clicking empty space in the file list clears the selection, like clicking outside Chonky does. It follows `clearSelectionOnOutsideClick` and is skipped while Ctrl, Cmd or Shift is held.
- Dependencies are no longer bundled into `dist/`. They are installed alongside Chonky, so an app that uses the same libraries shares one copy.
- Removed the `classnames`, `deepmerge`, `exact-trie`, `fast-sort`, `filesize`, `fuzzy-search`, `react-intl`, `react-jss`, `react-virtualized-auto-sizer`, `redux-watch` and `shortid` dependencies.
- The grid view fills its width: `entryWidth` is now the smallest tile width, as many tiles as fit go in a row, and they stretch to share the leftover space. Room for a scrollbar is only kept when the tiles overflow.
- `@reduxjs/toolkit` is now `^2.9.0` (was `>=1.9.0`, which allowed 1.x versions Chonky doesn't work with).
- The search matches words instead of letters: a file is shown when every space-separated word typed is part of its name (or `searchText`), ignoring case. Before, letters only had to appear in order, so `pdf` also matched `profile_draft.png`. Spaces around the text no longer affect the search.
- The search is cleared when the current folder changes, and when a new folder or upload, or a file passed to `revealFiles`, would be hidden by it.
- Registering `UploadFiles` also registers `DropFiles`, so an app that uploads files gets drag-and-drop uploads too. Handle `DropFiles` along with `UploadFiles`.
- Scrollbars inside Chonky are thin, in the theme's colours.
- `revealFiles` keeps waiting while the `loading` prop is on or the list is empty, since apps often clear the list while they load a folder. Before, the first files update without the file cancelled it.

### Fixed

- `require('chonky2')` failed in Node because the CommonJS build had a `.js` extension inside a `"type": "module"` package.
- Type declarations imported from `tsdef`, which was a dev-only dependency, so some types resolved to `any` for consumers.
- Files could not be dropped onto a folder in the breadcrumb after navigating into a subfolder. Drag-and-drop targets kept the state from their first render, so a breadcrumb that started out as the current folder never accepted drops.
- Holding a dragged file over a breadcrumb for 1.5 seconds opened that folder, which made it the current folder and cancelled the drop onto it. Breadcrumbs no longer open on hover; folders in the file list still do.
- Button, menu item, breadcrumb and list view labels sat about 2px above their icons. Labels are now trimmed to their cap height (`text-box`), so they center on the icons in browsers that support it. Breadcrumbs also use a font 1px smaller than the rest of Chonky, and their separators are 12px.
- Loading spinners now actually spin.
- File names without a dot (e.g. `README`) were shown as `.README`.
- React warning about a missing `key` in the context menu.
- Files hidden by the search stayed selected, so actions such as Delete applied to files the user couldn't see. Select all (Ctrl+A) also selected them, and hidden files (`isHidden`) too. Files are now deselected when they get hidden, and Select all only selects visible files. The status bar's hidden file count, which always showed 0, now works.
- Shift+click range selection didn't work while a search was active or hidden files were filtered out.
- The search field's loading spinner kept spinning if the text was changed back within 300 ms, or if Escape was pressed right after typing.
- Toolbar menus and the context menu opened behind modals with a `z-index` above 1300, such as MUI's `Modal`. Menus now use `--chonky-menu-z-index` (2000).
- Keyboard shortcuts applied to the whole page while Chonky was mounted, even hidden (e.g. in a closed dialog that stays mounted): Ctrl+A, Ctrl+C and the others were taken away from the rest of the page, and every Chonky on the page reacted. Shortcuts now apply while focus is inside that Chonky, or on an element around it (the page body, or a dialog that just opened with Chonky in it) as long as that Chonky is visible, is the only one there, and no other text on the page is selected. Clicking anywhere in Chonky, including empty list space, puts focus in it, and focus stays in Chonky after Enter or Escape in the rename field.
- The tops of tall letters in list view names and columns were cut off with fonts whose capitals are short compared to their other letters. Names are now only clipped sideways.
- `disableDragAndDropProvider` now works with an app-level `DndProvider`. `react-dnd` and `react-dnd-html5-backend` are no longer bundled, so Chonky shares the app's drag-and-drop context. They remain regular dependencies, so no extra install is needed. Based on [#1](https://github.com/owlpro/chonky2/pull/1) by @ttessman.
- Added `types` to the `exports` map so bundlers using `moduleResolution: "bundler"` resolve the type declarations.

### Development

- Added a playground: `yarn dev` builds the library in watch mode and serves a demo that runs against `dist/`.
- Fixed CI: a single job on Node 20 that installs with Yarn 4, builds, and checks bundle size. Removed the broken `size` workflow and pointed `size-limit` at the current `dist/` files.
- Removed unused dev dependencies (Babel, Rollup plugins, `tsup`, `husky`, `chalk`, stale `@types/*`) and `scripts/check-peer-deps.js`. `size-limit` now checks only the ESM build, with a 65 kB limit.
- Rewrote the README for v7: screenshots, a working quick start, actions and shortcuts, file fields, theming variables, translation message IDs, and upgrade notes.
- Reorganized the README for readers new to Chonky: what it is and how it works, a table of contents, installation, guides, a props and ref reference, and how to run the playground. New screenshots, including the context menu and the playground.
- The playground uses an app-level `DndProvider` by default, so files can be dropped onto the drop zone below the window. It registers rename, cut, paste and drop-to-upload, shows a custom `Show info` action in the Actions menu and a close button at the end of the toolbar.
- The playground uses Chonky's `FileSidebar`, has a Loading toggle, and has a picture whose thumbnail is missing.
- The playground is a full explorer window with a sidebar, sample folders with thumbnails, working Create folder, Upload and Delete actions, a dark mode toggle and a log of every Chonky event.
- Added store tests for search, `revealFiles` and the selection and search watchers (`test/search.test.ts`). They need no DOM, so they run with `npx vitest run test/search.test.ts`.
- The playground log shows the search text of `ChangeSearch`.
- `yarn watch:linked` builds `dist-linked/` for trying Chonky inside another Vite app during development: unminified, with source maps and type declarations, and with all dependencies except React bundled in.
- Store tests for selecting the folder the user came out of.
