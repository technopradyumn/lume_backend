# Versioning

Lume Backend follows Semantic Versioning: `MAJOR.MINOR.PATCH`.

- `MAJOR`: incompatible API or platform changes.
- `MINOR`: backward-compatible endpoints and capabilities.
- `PATCH`: backward-compatible fixes.

Public endpoints remain namespaced under `/api/v1`. The service release is
stored in `package.json` and mirrored by `src/shared/config/version.js`.
Release work uses `version/backend-vX.Y.Z`. Before merging a release, run
`npm run version:check` and `npm run check`.

Runtime version metadata is available from `GET /api/version` and
`GET /api/v1`.

Current release: **1.1.0** on `version/backend-v1.1.0`.

## Release workflow

1. Create `version/backend-vX.Y.Z` from an up-to-date `main`.
2. Update `package.json`, `package-lock.json`, the runtime version config, and
   `CHANGELOG.md`.
3. Run `npm run version:check` and `npm run check`.
4. Merge the reviewed version branch into `main`.
5. Tag the merge commit as `backend-vX.Y.Z`.
