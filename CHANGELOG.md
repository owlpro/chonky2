# Changelog

All notable changes to `chonky2` are listed here, grouped by released version.
The project follows [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Development

- Added a playground: `yarn dev` builds the library in watch mode and serves a demo that runs against `dist/`.
- Fixed CI: a single job on Node 20 that installs with Yarn 4, builds, and checks bundle size. Removed the broken `size` workflow and pointed `size-limit` at the current `dist/` files.

## [6.5.9]

### Fixed

- `disableDragAndDropProvider` now works with an app-level `DndProvider`. `react-dnd` and `react-dnd-html5-backend` are no longer bundled, so Chonky shares the app's drag-and-drop context. They remain regular dependencies, so no extra install is needed. Based on [#1](https://github.com/owlpro/chonky2/pull/1) by @ttessman.
- Added `types` to the `exports` map so bundlers using `moduleResolution: "bundler"` resolve the type declarations.
