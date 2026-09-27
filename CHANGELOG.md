# Changelog

All notable changes to `chonky2` are listed here, grouped by released version.
The project follows [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Breaking

- Chonky no longer uses Material UI, Emotion, styled-components or JSS. The only peer dependencies are now `react` and `react-dom`; `@mui/material`, `@mui/styled-engine-sc`, `@emotion/react`, `@emotion/styled` and `styled-components` can be uninstalled if the app doesn't use them itself. Together with the dependency changes below, Chonky's cost in an app bundle drops from about 139 KB to 55 KB (minified + brotli, all dependencies included).
- New Fluent (Windows 11 File Explorer) look. Styles are plain CSS injected once into `<head>`, and theme values are CSS variables on `.chonky-theme` (see `src/styles/chonky.css`). Overrides written against MUI's theme, MUI class names (`.MuiButton-root`, …) or the old `chonky-*` class names no longer apply.
- New layout: `FileToolbar` shows the current folder's name, one menu per action group and the ungrouped action buttons. The search field moved into `FileNavbar`, and the item count moved to the new `FileStatusBar`. Apps that render `FileToolbar` without `FileNavbar` no longer get a search field. `FullFileBrowser` now renders toolbar, navbar, list, status bar in that order.
- Default entry sizes changed: list rows are 34px (was 30px), grid tiles are 140×140 (was 165×130) and compact entries 240×52 (was 220×40).
- `react-intl` is no longer used; Chonky formats messages itself with the browser's `Intl` APIs. `i18n` accepts `locale`, `defaultLocale`, `messages`, `timeZone` and `formatters`; other `react-intl` options (`formats`, `textComponent`, `onError`, …) are ignored. Messages support `{arg}`, `plural`, `selectordinal`, `select`, `#`, `number`/`date`/`time` arguments and apostrophe quoting, but not rich-text tags such as `<b>…</b>`. Custom `formatters` receive a `ChonkyIntl` object instead of `react-intl`'s `IntlShape`; it has the same `formatMessage`, `formatDate`, `formatTime` and `formatNumber` methods, so most formatters only need a type change.
- The CommonJS build is now `dist/index.cjs` (was `dist/index.cjs.js`). Deep imports of that file need updating; `require('chonky2')` is unaffected.

### Added

- Back and Forward navigation: `ChonkyActions.GoBack` and `ChonkyActions.GoForward` (Alt+Left and Alt+Right) reopen previously visited folders by requesting `OpenFiles`, so apps need no extra code.
- `FileStatusBar` component.
- List view column headings (Name, Type, Size, Date modified). Clicking one sorts by it, clicking it again reverses the order.
- Type column, formatted by the new `formatFileType` formatter (`Folder`, `PDF File`, …). Folders with `childrenCount` show an item count in the Size column.
- Colour-coded file icons: a folder, or a page labelled with the file's extension, in a colour per file type. They are used unless the app sets `iconComponent` or a file sets `icon`. Grid tiles show `thumbnailUrl` images.
- `ChonkyIconName.goBack` and `ChonkyIconName.goForward`.

### Changed

- Menus (toolbar dropdowns and the context menu) are Chonky's own component: they render in a portal, stay inside the viewport, close on outside click, Escape, scroll or resize, and support arrow-key, Home and End navigation.
- File sizes use `KB` for kilobytes everywhere (bigger files showed `kB`).
- Enabled options in menus show a check mark instead of a toggle icon, and the Up button shows an arrow.
- Clicking empty space in the file list clears the selection, like clicking outside Chonky does. It follows `clearSelectionOnOutsideClick` and is skipped while Ctrl, Cmd or Shift is held.
- Dependencies are no longer bundled into `dist/`. They are installed alongside Chonky, so an app that uses the same libraries shares one copy.
- Removed the `classnames`, `deepmerge`, `exact-trie`, `fast-sort`, `filesize`, `fuzzy-search`, `react-intl`, `react-jss`, `react-virtualized-auto-sizer`, `redux-watch` and `shortid` dependencies.
- `@reduxjs/toolkit` is now `^2.9.0` (was `>=1.9.0`, which allowed 1.x versions Chonky doesn't work with).

### Fixed

- `require('chonky2')` failed in Node because the CommonJS build had a `.js` extension inside a `"type": "module"` package.
- Type declarations imported from `tsdef`, which was a dev-only dependency, so some types resolved to `any` for consumers.
- Files could not be dropped onto a folder in the breadcrumb after navigating into a subfolder. Drag-and-drop targets kept the state from their first render, so a breadcrumb that started out as the current folder never accepted drops.
- Loading spinners now actually spin.
- File names without a dot (e.g. `README`) were shown as `.README`.
- React warning about a missing `key` in the context menu.

### Development

- Added a playground: `yarn dev` builds the library in watch mode and serves a demo that runs against `dist/`.
- Fixed CI: a single job on Node 20 that installs with Yarn 4, builds, and checks bundle size. Removed the broken `size` workflow and pointed `size-limit` at the current `dist/` files.
- Removed unused dev dependencies (Babel, Rollup plugins, `tsup`, `husky`, `chalk`, stale `@types/*`) and `scripts/check-peer-deps.js`. `size-limit` now checks only the ESM build, with a 60 kB limit.
- Rewrote the README for v7: screenshots, a working quick start, actions and shortcuts, file fields, theming variables, translation message IDs, and upgrade notes.
- The playground is a full explorer window with a sidebar, sample folders with thumbnails, working Create folder, Upload and Delete actions, a dark mode toggle and a log of every Chonky event.

## [6.5.9]

### Fixed

- `disableDragAndDropProvider` now works with an app-level `DndProvider`. `react-dnd` and `react-dnd-html5-backend` are no longer bundled, so Chonky shares the app's drag-and-drop context. They remain regular dependencies, so no extra install is needed. Based on [#1](https://github.com/owlpro/chonky2/pull/1) by @ttessman.
- Added `types` to the `exports` map so bundlers using `moduleResolution: "bundler"` resolve the type declarations.
