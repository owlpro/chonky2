# chonky2

## Versioning and changelog

The package follows [Semantic Versioning](https://semver.org/). Versions track what consumers get from npm, not individual commits.

- Every change to published code (`src/`, build config, `package.json` fields that affect consumers) gets an entry in `CHANGELOG.md` under `## [Unreleased]`, in the matching group: `Added`, `Changed`, `Fixed`, `Removed`, or `Breaking`.
- Changes that do not reach npm (playground, CI, docs) go under `Development` and do not require a version bump on their own.
- When a release is cut, bump `version` in `package.json` and rename `[Unreleased]` to the new version:
  - **patch** (6.5.x): bug fixes, no API change.
  - **minor** (6.x.0): new features or props, backward compatible.
  - **major** (x.0.0): anything that breaks existing consumers, such as removed props, new required peer dependencies, or a raised minimum React/MUI version.
- The version bump and changelog edit belong in the same commit as the change that triggers the release, or in a dedicated release commit when several changes ship together.
