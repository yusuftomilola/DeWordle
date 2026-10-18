<!-- markdownlint-disable MD013 -->
# Release Process

This document defines how DeWordle components are versioned, what a release
checklist must cover, and how component versions relate to each other.

## Components and versioning

Each component follows [Semantic Versioning 2.0.0](https://semver.org/)
(`MAJOR.MINOR.PATCH`) **independently**. Bumping one component never forces a
bump in another; the compatibility matrix below records which combinations are
supported.

| Component | Where the version lives | Tag format | Bump MAJOR when | Bump MINOR when | Bump PATCH when |
| --- | --- | --- | --- | --- | --- |
| Soroban contracts | `version.workspace` in `soroban/Cargo.toml`, plus each contract's `get_metadata().version` | `vX.Y.Z` | Storage layout or ABI change that needs a migration or breaks existing callers | New backwards-compatible entrypoint, event or storage key | Bug fix with no ABI or storage change |
| TypeScript SDK | `soroban/sdk/ts/package.json` (`SDK_VERSION` in `contract-compat.ts` must match) | `sdk-vX.Y.Z` | Removed or changed public client methods | New client methods or options | Bug fix |
| Backend (API and indexer) | `backend/package.json` | `backend-vX.Y.Z` | Breaking REST/WebSocket change (see `docs/API_VERSIONING.md`) | New endpoints or fields | Bug fix |
| Frontend | `frontend/package.json` | `frontend-vX.Y.Z` | Dropped browser support or a user-visible redesign | New user-facing features | Bug fix |

Rules that apply to every component:

- Versions are bumped in the release pull request, not in feature pull
  requests.
- A version is never reused. If a tag was pushed by mistake, publish the next
  patch instead of moving the tag.
- While a component is `0.y.z`, a MINOR bump may contain breaking changes.
  Say so in the release notes.

### Contract version fields

Each contract reports its release through `get_metadata()`:

- `version` is the contract release number returned by `version()`. Increase
  it for every deployed ABI or behaviour change.
- `abi_hash` is the SHA-256 of the sorted list of public entrypoints. Update
  the descriptor (and bump `version`) whenever an entrypoint is added,
  removed or its signature changes.
- `min_sdk_version` is the oldest SDK that can call the contract. Raise it
  whenever the SDK must change to stay compatible; the SDK refuses to build
  transactions against a contract whose `min_sdk_version` is newer than
  `SDK_VERSION`.

After an upgrade, an admin calls `update_metadata` so the on-chain record
matches the new binary.

## Pre-release naming

Append a pre-release identifier to the version being prepared:

| Stage | Format | Meaning |
| --- | --- | --- |
| Alpha | `X.Y.Z-alpha.N` | Incomplete; interfaces may still change. Internal and testnet only. |
| Beta | `X.Y.Z-beta.N` | Feature complete; collecting feedback. Testnet only. |
| Release candidate | `X.Y.Z-rc.N` | Intended to ship unchanged unless a blocker is found. |

Counters (`N`) start at `1` and increase for every new pre-release of the same
`X.Y.Z`. Pre-releases are tagged exactly like final releases, for example
`v1.2.0-rc.1`, and are published as GitHub *pre-releases*. Mainnet deployments
use final versions only.

## Release checklist

Copy this list into the release pull request and tick each item.

### 1. Prepare

- [ ] All issues for the release are merged to `main`.
- [ ] The version is bumped in the files listed in the table above, with the
      changelog or release notes updated.
- [ ] For contracts: `abi_hash` descriptor, `version` and `min_sdk_version`
      are updated, and `update_metadata` is planned for the upgrade.
- [ ] The compatibility matrix in this document is updated.

### 2. Test

- [ ] CI is green on the release pull request: `ci.yml`,
      `contracts-ci.yml` (`cargo test --all` and `stellar contract build`),
      `coverage.yml` and the other required checks.
- [ ] Contracts: `cd soroban && cargo test --workspace` passes locally.
- [ ] Backend: `cd backend && npm run test:ci`; if migrations changed, the
      `migration-rollback.yml` workflow passes (up and down).
- [ ] Frontend: `cd frontend && npm run test:ci`, and the E2E suite when UI
      flows changed.
- [ ] Pre-releases: smoke-test on testnet with the exact artifacts.

### 3. Tag

- [ ] Merge the release pull request.
- [ ] Create an annotated tag on the merge commit, using the tag format in the
      table above:

  ```bash
  git tag -a v1.2.0 -m "Contracts v1.2.0"
  git push origin v1.2.0
  ```

- [ ] Tags are pushed by a maintainer only, and only from `main`.

### 4. Build

Tag pushes trigger these workflows:

| Workflow | Trigger | Output |
| --- | --- | --- |
| `release.yml` (WASM Release) | tags matching `v*.*.*` | Optimised `.wasm` files and `.sha256` checksums attached to a GitHub release |
| `release-notes.yml` (Release Notes Draft) | tags matching `v*` | Draft release notes from the commits since the previous tag |
| `wasm-checksum.yml` | pushes and pull requests touching `contracts/**` | Reproducible-build check of the contract WASM. Its path filter does not match `soroban/contracts/**`, so it does not currently run for contract changes. |

`release.yml` and `release-notes.yml` match plain `v*` tags only, so they run
for **contract** releases. Releases of the SDK, backend and frontend use their
prefixed tags and are built and published by hand (or by their own pipelines)
until dedicated workflows exist.

- [ ] Confirm the release workflow finished and the GitHub release contains
      every `.wasm` and `.sha256` file.
- [ ] Verify at least one checksum locally with `sha256sum -c`.
- [ ] Edit the draft release notes; mark pre-releases as *pre-release*.

### 5. Deploy

Deploy in dependency order so a consumer never sees a producer it cannot talk
to:

1. **Contracts**: deploy or upgrade, then call `update_metadata` on each
   upgraded contract and confirm `get_metadata()` returns the new values.
2. **Backend**: run migrations, deploy, and confirm the indexer resumes from
   its cursor. Roll back with `npm run typeorm:migration:revert` in
   `backend/` (add `-- -t none` for migrations that declare
   `transaction = false`).
3. **SDK**: publish the new SDK version if it changed.
4. **Frontend**: deploy last, after the SDK and contract versions it needs are
   live.

- [ ] Post-deploy smoke test: create a session, submit a guess, and read the
      leaderboard on the target network.
- [ ] Record the deployed versions in the compatibility matrix below.

### 6. Roll back

If a release fails verification, roll back in the reverse order (frontend,
SDK, backend, contracts). Contract upgrades that changed storage layout need a
forward fix; do not redeploy the old WASM over migrated storage without a
migration plan.

## Version compatibility matrix

The SDK enforces the contract column at runtime through `get_metadata()`.
The other columns are verified by CI and release testing.

| Contracts | Min SDK | SDK | Backend | Frontend | Status |
| --- | --- | --- | --- | --- | --- |
| 0.1.x | 0.1.0 | 0.1.x | 0.0.x | 0.1.x | Current |

When a release changes a row, add a new row instead of editing history, and
mark superseded rows *Superseded* or *Unsupported*.

## Related documents

- [Contributing guide](../CONTRIBUTING.md)
- [API versioning](./API_VERSIONING.md)
- [Soroban SDK guide](./SOROBAN_SDK_GUIDE.md)
- [CI setup](./CI_SETUP.md)
