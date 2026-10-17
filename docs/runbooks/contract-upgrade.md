# Contract Upgrade Runbook

## Purpose
This runbook documents how to perform safe production upgrades of the DeWordle Soroban contracts, including pre-verification, execution, post-validation, and rollback procedures.

## Scope
This runbook applies to the four canonical contracts:
- `admin_registry`
- `core_game`
- `rewards`
- `achievements`

It is designed for production upgrades. For testnet dry runs, follow the same checklist but mark validation steps as non-blocking where network access is limited.

## Prerequisites
- Access to the production deployment keys and the Soroban network details (RPC URL, network passphrase). Store secrets in the approved secret manager, never in plain text or this repo.
- [starkli](https://github.com/xJonathanLEI/starkli) / Soroban CLI is **not** assumed; this runbook references the project's shell scripts and the WASM reproducibility tooling. The Soroban CLI (`stellar`) may be used if present.
- The `.github/workflows/wasm-checksum.yml` build environment for the release commit (`wasm-build-env.txt` and `wasm-checksums.txt`).
- The contracts registry for the target network (see `soroban/config/contracts.<network>.json`).
- A fresh working copy at the release tag (e.g. `vX.Y.Z`).
- The `admin_registry` admin account is required to authorize upgrade/registry operations.
- The `WASM Checksum Verifier` workflow run for the release commit, with downloaded artifacts.
- Out-of-band communication channel for the release (PagerDuty/Slack) in case of escalation.

## Emergency Contacts
| Role | Responsibility | Contact |
|------|---------------|---------|
| Release Lead | Approves the upgrade window and final sign-off | [team-release@dewordle.example] |
| Protocol Engineering | Owns contract changes and rollback decision | [team-protocol@dewordle.example] |
| SRE/Infra | Network, RPC, and observability during the upgrade | [team-sre@dewordle.example] |
| Security | Incident response if a security regression is suspected | [team-security@dewordle.example] |

> Contact values are placeholders. Update them to match the current on-call rotation before use.

## Pre-Upgrade Verification
Complete the following before touching production contracts:

1. **Confirm the target release.**
   - Tag: `v<major>.<minor>.<patch>` (ensure it matches the planned release).
   - Commit SHA: `git rev-parse <tag>`.
   - PRs included: review the release notes (see `docs/release-notes/` if present) and confirm all required changes are present.
2. **Verify reproducible WASM.**
   - Download `wasm-checksums.txt` and `wasm-build-env.txt` from the "WASM Checksum Verifier" run for the release commit.
   - Build locally at the tag: `cd soroban && make build-wasm`.
   - Run `./scripts/verify_wasm_checksums.sh wasm-checksums.txt`. **Do not proceed if any mismatch is reported.**
   - Compare `rustc`/`cargo`/Soroban SDK versions in `wasm-build-env.txt` against the expected known-good versions (documented in `soroban/README.md`).
3. **Verify contract checksums baseline (deployment artifacts).**
   - Check the deployment artifact store for `soroban/scripts/deploy/wasm-checksums.txt` if one is tracked, or run `soroban/scripts/deploy/checksum-wasm-artifacts.sh` against the freshly built release artifacts to confirm no unexpected checksum drift from the audited baseline.
4. **Review registry and network configuration.**
   - Open `soroban/config/contracts.<network>.json` (for `mainnet`/`testnet` as appropriate) and confirm the expected contract addresses and the `network` field.
   - Confirm the target network RPC is healthy and accessible from the execution environment. Record a pre-upgrade snapshot of recent RPC errors from observability if available.
5. **Verify admin access.**
   - Confirm the executing key controls the `admin_registry` admin account for the target network.
   - Dry-run any privileged invocations against testnet first (using `soroban/scripts/invoke/` or equivalent) if possible.
6. **Establish a rollback checkpoint.**
   - Record the current `admin_registry` admin, all four contract addresses, and the latest known good release tag (e.g. `vX.Y.Z-1`).
   - Snapshot the transaction policy, pause state (if any), and any feature flags that could affect gameplay.
   - Define the rollback window and communication plan with the emergency contacts.
7. **Communication and approval.**
   - Notify the release channel of the upgrade window, expected duration, and owner.
   - Obtain explicit approval from Protocol Engineering and SRE before proceeding.

**Checkpoint:** All pre-upgrade items are complete. No WASM mismatch. Regression is not suspected.

## Upgrade Procedure
Execute the steps below in order. Record timestamps, transaction hashes, and operator initials for every step.

1. **Announce start.**
   - Post to the release channel: "Starting contract upgrade to `<tag>` on `<network>`."
2. **Prepare working directory.**
   - `git fetch --tags && git checkout <tag>`
   - `cd soroban`
   - Confirm HEAD matches the release commit from step 1 of pre-verification.
3. **Re-verify WASM (in-session).**
   - `make build-wasm`
   - `./scripts/verify_wasm_checksums.sh /path/to/downloaded/wasm-checksums.txt`
   - Exit if verification fails. **Do not continue.** Investigate and either fix or abort.
4. **Pause if required.**
   - If the `core_game` contract supports `pause`, and the release requires downtime, pause via the authorized `admin_registry` path (scripted if available). Record the pause transaction hash.
   - Note: some releases do not require a pause; only do this if the release notes explicitly require it or if a safety hold is declared.
5. **Deploy/upgrade contracts.**
   - For a fresh deploy: run `./scripts/deploy/deploy-testnet.sh` as a template for the target network, providing the required environment variables (`SOROBAN_RPC_URL`, `SOROBAN_NETWORK_PASSPHRASE`, `SOROBAN_SECRET_KEY`). Replace with production values from the secret manager.
   - For upgrades: use the Soroban CLI `contract upgrade` (or the project's deployment tooling) to upload and install the new WASM, pointing at each existing contract address.
   - Record for each contract: WASM hash, transaction hash, new version (if exposed), and the resulting contract address (should remain the same for upgrades).
6. **Update registry.**
   - If new WASM was deployed, update `soroban/config/contracts.<network>.json` with the resulting addresses only if they changed (upgrades preserve addresses). For upgrades, registry entries typically remain unchanged.
   - If the admin key or any contract alias changed, update the registry via `admin_registry.set_contract` using the authorized key.
   - Commit a registry update in a separate change only if the canonical registry is stored in-repo for the network; otherwise document the off-repo change.
7. **Unpause.**
   - If paused in step 4, unpause `core_game` and record the transaction hash.

**Checkpoint:** All contracts upgraded, registry consistent with deployed addresses, pause state restored (if modified).

## Post-Upgrade Validation
Validate correctness before declaring success.

1. **Read-only smoke checks.**
   - Query `admin_registry.get_admin()` and confirm it matches the expected admin.
   - Query `core_game.version()` (if exposed) and confirm it matches the release version.
   - Query `rewards.version()` and `achievements.version()` if they expose versions.
   - Invoke a read-only method for each contract (e.g. `get_day_config`, `get_session` for `core_game`, or registry reads) to confirm they respond without errors.
2. **Integration smoke test.**
   - Run a small end-to-end smoke: create a game session against the upgraded `core_game`, submit a valid guess, and observe the resulting event projections (via backend read models) if applicable. Use the SDK if present (`soroban/sdk/ts`).
   - Confirm `admin_registry.has_role` / role checks behave as expected if roles were modified.
3. **Observability checks.**
   - Check RPC error rates, latency, and throughput against baseline from pre-upgrade.
   - Check the indexer for backpressure, failed event processing, or DLQ growth (if the backend indexer is in use).
   - Check contract event volume and gas usage for anomalies.
4. **Artifact persistence.**
   - Archive the exact WASM used for each upgrade (`*.wasm`), `wasm-checksums.txt`, and `wasm-build-env.txt` alongside the release tag evidence.
   - Record all transaction hashes in the release evidence file (e.g. `RELEASE_EVIDENCE_<tag>.md`) if it exists.
5. **Sign-off.**
   - Update the release channel with the outcome and a summary of validation results.
   - Protocol Engineering and SRE provide explicit go/no-go sign-off. Only then mark the release as complete.

**Success criteria:** All read-only checks pass, a minimal write/read round-trip succeeds, and no alerts fire in the observability window (e.g. 10–15 minutes post-upgrade).

## Rollback Procedure
Only execute rollback if validation fails, critical alerts fire, or a security regression is confirmed.

1. **Stop and assess.**
   - Announce a rollback hold in the release channel. Escalate to all emergency contacts.
   - Capture logs, recent transactions, and any error payloads for incident analysis.
2. **Revert to the last known good build.**
   - Check out the previous release tag `vX.Y.Z-1` (or the recorded checkpoint).
   - Re-verify WASM against the known-good `wasm-checksums.txt` for that tag.
   - Upgrade contracts to the previous WASM using the same upgrade path, targeting the existing contract addresses. Record all transaction hashes.
3. **Restore registry state.**
   - Restore `soroban/config/contracts.<network>.json` to the checkpoint state if it was modified.
   - Restore any admin/role configuration that was changed during the failed upgrade (via `admin_registry` if necessary).
4. **Restore pause state.**
   - If the system was paused, restore the checkpoint pause state.
5. **Post-rollback validation.**
   - Run the same smoke checks as post-upgrade (steps 1–3 above). Confirm the system behaves as it did at the checkpoint.
6. **Document and learn.**
   - File an incident report with root cause, timeline, and lessons learned.
   - Update this runbook with any gaps discovered.

## Notes and Tips
- **Never** deploy unverified WASM. The checksum verification step is mandatory, even in emergencies (use the known-good artifacts for the target rollback tag).
- Keep this runbook in sync with deployment scripts in `soroban/scripts/deploy/`. If a script changes, update the procedure references.
- For testnet, `deploy-testnet.sh` is a scaffold. Replace the placeholder message with actual `stellar contract deploy`/`upgrade` invocations when implementing production-grade deployment.
- The WASM checksum baseline helper (`checksum-wasm-artifacts.sh`) can be used to assert no drift in the checked-in baseline. Treat baseline changes as requiring the same audit level as a source change.
- Registry changes must respect `admin_registry` authorization: only the admin can `set_contract`. Never expose private keys in logs or commit messages.