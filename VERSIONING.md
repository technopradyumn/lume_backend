# Versioning

Lume Backend follows Semantic Versioning: `MAJOR.MINOR.PATCH`.

- `MAJOR`: incompatible API or platform changes.
- `MINOR`: backward-compatible endpoints and capabilities.
- `PATCH`: backward-compatible fixes.

Public endpoints remain namespaced under `/api/v1`. The service release is
stored in `package.json` and mirrored by `src/shared/config/version.js`. This
repository uses the GitFlow model described in David Mosyan's
[Version Control Branching Strategies](https://medium.com/@dmosyan/version-control-branching-strategies-e68e8d5ef1e0).

Runtime version metadata is available from `GET /api/version` and
`GET /api/v1`.

Release candidate: **1.1.0** on `release/1.1.0`.

## Branches

- `main`: permanent, production-ready code only. Every release is tagged.
- `develop`: permanent integration branch for the next release.
- `feature/<description>`: short-lived, created from and merged into `develop`.
- `release/<X.Y.Z>`: short-lived stabilization branch created from `develop`;
  only version changes, documentation, and release fixes belong here.
- `hotfix/<X.Y.Z>`: urgent production fix created from `main`, then merged into
  both `main` and `develop`.

Branch names never include `backend` because this repository already contains
only the backend.

## Release workflow

1. Merge completed `feature/*` branches into `develop`.
2. Create `release/X.Y.Z` from `develop`.
3. Update `package.json`, `package-lock.json`, the runtime version config, and
   `CHANGELOG.md`; then run `npm run version:check` and `npm run check`.
4. Merge the release into both `main` and `develop`.
5. Tag the `main` merge commit as `vX.Y.Z`, then delete the release branch.
