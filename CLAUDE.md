# chonky2

## Versioning and changelog

The package follows [Semantic Versioning](https://semver.org/).

- Every commit that changes published code (`src/`, build config, `package.json` fields that affect consumers) bumps `version` in `package.json` in that same commit, without being asked, by the kind of change:
  - **patch** (6.5.x): bug fixes, no API change.
  - **minor** (6.x.0): new features or props, backward compatible.
  - **major** (x.0.0): anything that breaks existing consumers, such as removed props, new required peer dependencies, or a raised minimum React/MUI version.
  - A commit with several kinds of change takes the largest bump.
- The commit's `CHANGELOG.md` entries go under a heading for the new version (`## [x.y.z]`), in the matching group: `Added`, `Changed`, `Fixed`, `Removed`, or `Breaking`. `## [Unreleased]` stays at the top, empty of published changes.
- Changes that do not reach npm (playground, CI, docs, website) do not bump the version. They go under `Development` in `## [Unreleased]`, and move into the next version's section when that version is written.
