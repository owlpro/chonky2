# Changelog

All notable changes to `chonky2` are listed here, grouped by released version.
The project follows [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Breaking

- Chonky no longer uses Material UI, Emotion, styled-components or JSS. The only peer dependencies are now `react` and `react-dom`; `@mui/material`, `@mui/styled-engine-sc`, `@emotion/react`, `@emotion/styled` and `styled-components` can be uninstalled if the app doesn't use them itself. Together with the dependency changes below, Chonky's cost in an app bundle drops from about 139 KB to 54 KB (minified + brotli, all dependencies included).
- Styles are plain CSS injected once into `<head>`, and theme values are CSS variables on `.chonky-theme` (see `src/styles/chonky.css`). Overrides written against MUI's theme or MUI class names (`.MuiButton-root`, `.MuiMenu-list`, …) no longer apply. The toolbar buttons, search field and menus look slightly different.
- `react-intl` is no longer used; Chonky formats messages itself with the browser's `Intl` APIs. `i18n` accepts `locale`, `defaultLocale`, `messages`, `timeZone` and `formatters`; other `react-intl` options (`formats`, `textComponent`, `onError`, …) are ignored. Messages support `{arg}`, `plural`, `selectordinal`, `select`, `#`, `number`/`date`/`time` arguments and apostrophe quoting, but not rich-text tags such as `<b>…</b>`. Custom `formatters` receive a `ChonkyIntl` object instead of `react-intl`'s `IntlShape`; it has the same `formatMessage`, `formatDate`, `formatTime` and `formatNumber` methods, so most formatters only need a type change.
- The CommonJS build is now `dist/index.cjs` (was `dist/index.cjs.js`). Deep imports of that file need updating; `require('chonky2')` is unaffected.

### Changed

- Menus (toolbar dropdowns and the context menu) are Chonky's own component: they render in a portal, stay inside the viewport, close on outside click, Escape, scroll or resize, and support arrow-key, Home and End navigation.
- Clicking empty space in the file list clears the selection, like clicking outside Chonky does. It follows `clearSelectionOnOutsideClick` and is skipped while Ctrl, Cmd or Shift is held.
- Dependencies are no longer bundled into `dist/`. They are installed alongside Chonky, so an app that uses the same libraries shares one copy.
- Removed the `classnames`, `deepmerge`, `exact-trie`, `fast-sort`, `filesize`, `fuzzy-search`, `react-intl`, `react-jss`, `react-virtualized-auto-sizer`, `redux-watch` and `shortid` dependencies.
- `@reduxjs/toolkit` is now `^2.9.0` (was `>=1.9.0`, which allowed 1.x versions Chonky doesn't work with).

### Fixed

- `require('chonky2')` failed in Node because the CommonJS build had a `.js` extension inside a `"type": "module"` package.
- Type declarations imported from `tsdef`, which was a dev-only dependency, so some types resolved to `any` for consumers.
- Files could not be dropped onto a folder in the breadcrumb after navigating into a subfolder. Drag-and-drop targets kept the state from their first render, so a breadcrumb that started out as the current folder never accepted drops.
- Loading spinners now actually spin.
- React warning about a missing `key` in the context menu.

### Development

- Added a playground: `yarn dev` builds the library in watch mode and serves a demo that runs against `dist/`.
- Fixed CI: a single job on Node 20 that installs with Yarn 4, builds, and checks bundle size. Removed the broken `size` workflow and pointed `size-limit` at the current `dist/` files.
- Removed unused dev dependencies (Babel, Rollup plugins, `tsup`, `husky`, `chalk`, stale `@types/*`) and `scripts/check-peer-deps.js`. `size-limit` now checks only the ESM build, with a 60 kB limit.
- The playground has a dark mode toggle, logs every Chonky event, and some files have sizes and dates.

## [6.5.9]

### Fixed

- `disableDragAndDropProvider` now works with an app-level `DndProvider`. `react-dnd` and `react-dnd-html5-backend` are no longer bundled, so Chonky shares the app's drag-and-drop context. They remain regular dependencies, so no extra install is needed. Based on [#1](https://github.com/owlpro/chonky2/pull/1) by @ttessman.
- Added `types` to the `exports` map so bundlers using `moduleResolution: "bundler"` resolve the type declarations.
