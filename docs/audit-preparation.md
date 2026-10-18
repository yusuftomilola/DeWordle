<!-- markdownlint-disable MD013 -->

# Smart contract audit preparation checklist

Work through this list before asking for a security audit of the Soroban
contracts in [`soroban/`](../soroban). Tick items off in the pull request that
requests the audit and record the commit hash that was reviewed.

**Status key:** `[ ]` open, `[x]` done. The status column in the tables below
shows where the repository stands today; update it as work lands.

## 1. Code documentation

- [ ] Every public contract function has a doc comment describing its purpose,
      parameters, return value, errors and emitted events.
- [ ] Every `contracterror` variant is documented and listed in
      [ERROR_CODE_REFERENCE](./ERROR_CODE_REFERENCE.md).
- [ ] Storage keys (`DataKey` variants) are documented with their storage type
      (instance, persistent, temporary) and TTL policy.
- [ ] Event schemas are up to date in [EVENT_PAYLOAD_SCHEMAS](./EVENT_PAYLOAD_SCHEMAS.md).
- [ ] The architecture and trust boundaries in
      [SOROBAN_FOUNDATION_ARCHITECTURE](./SOROBAN_FOUNDATION_ARCHITECTURE.md) and the
      [threat model](./architecture/threat-model.md) match the code being audited.
- [ ] The commit to audit is tagged and `soroban/Cargo.lock` is committed.

## 2. Test coverage for audit readiness

Thresholds the auditors can rely on before they start:

| Area | Threshold | Status |
| --- | --- | --- |
| Public functions with at least one success-path test | 100% | [ ] |
| Public functions with at least one failure-path test per error variant | 100% | [ ] |
| Authorization: a test per `require_auth` / `require_admin` call proving an unauthorized caller is rejected | 100% | [ ] |
| Line coverage per contract crate | 85% or more | [ ] |
| Property-based tests for pure logic (for example guess evaluation) | present | [x] `core_game/tests/guess_eval_proptest.rs` |
| Fuzz targets for contract inputs | present | [x] `soroban/fuzz` (see [its README](../soroban/fuzz/README.md)) |
| Gas benchmarks with ceilings | present | [x] see [contract benchmarks](./contract-benchmarks.md) |
| Event topic uniqueness test | present | [x] `core_game/tests/event_topic_uniqueness.rs` |

Run everything with `cargo test --manifest-path soroban/Cargo.toml --workspace`.
The fuzz suite is the reference for how input-hardening coverage should look:
a named target, a seed corpus under version control and the same inputs
replayed as ordinary unit tests so CI exercises them without nightly Rust.

## 3. Known limitations and assumptions

Keep this list honest; auditors use it to separate intended behavior from bugs.

- **No on-chain upgrade entry point.** None of the contracts exposes a function
  that replaces its WASM. Upgrading means deploying a new contract and
  repointing consumers through `admin_registry`; see
  [section 5](#5-contract-upgrade-authorization).
- **Answers are committed, not verified on-chain.** `core_game` stores a puzzle
  commitment per day and records the outcome code and `is_correct` flag the
  caller supplies for each guess; guess evaluation is performed off-chain by
  the backend. The contract does not re-derive the outcome from a revealed word.
- **Admin is a single address.** Each contract stores one admin set at `init`;
  `admin_registry` tracks roles but the other contracts do not consult it for
  their own admin checks.
- **Reward points are an internal ledger.** `rewards` tracks balances and
  claimed totals; it does not mint or transfer a token.
- **Storage TTLs are never extended by the contracts.** No contract calls
  `extend_ttl`, so entries that are not touched before they expire are archived
  and must be restored. Decide on a TTL strategy (extend on access, or an
  operational job) before mainnet.
- **Time comes from the ledger.** Day closing uses the ledger timestamp, which
  validators set to within a few seconds of real time.
- Assumptions: Stellar validators are honest, the admin key is held in a
  hardware wallet or multisig account, and the backend that signs outcomes is
  trusted by the game design.

## 4. Access control matrix

Callers: **admin** is the address stored at `init`; **player** must authorize
the call (`require_auth`); **anyone** needs no authorization (read-only).

### `core_game`

| Function | Caller | Check |
| --- | --- | --- |
| `init` | admin (first call only) | rejects a second call with `AlreadyInitialized` |
| `pause` | admin | `require_admin` |
| `set_rotate_schedule` | admin | `require_admin` |
| `set_day_config` | admin | `require_admin` |
| `create_session` | player | `player.require_auth()`, not paused |
| `submit_guess` | session owner | `player.require_auth()` and owner check, not paused |
| `finalize_session` | session owner | `player.require_auth()` and owner check, not paused |
| `get_*`, `is_paused`, `is_nonce_used`, `version` | anyone | none |

### `rewards`

| Function | Caller | Check |
| --- | --- | --- |
| `init` | admin (first call only) | rejects a second call |
| `set_emission`, `accrue`, `record_win`, `set_rank` | admin | `require_admin` |
| `claim` | player | `player.require_auth()` |
| `balance_of`, `claimed_total`, `get_emission`, `get_player_stats`, `get_multiplier`, `verify_signature`, `version` | anyone | none |

### `achievements`

| Function | Caller | Check |
| --- | --- | --- |
| `init` | admin (first call only) | rejects a second call |
| `define`, `unlock` | admin | `require_admin` |
| `get_definition`, `get_unlocked`, `get_spec_metadata`, `version` | anyone | none |

### `admin_registry`

| Function | Caller | Check |
| --- | --- | --- |
| `init` | admin (first call only) | rejects a second call |
| `set_contract`, `set_role` | admin | `require_admin` |
| `get_contract`, `get_admin`, `has_role`, `verify_authorized`, `version` | anyone | none |

Before the audit, re-generate these tables from the code
(`grep -n "require_auth\|require_admin" soroban/contracts/*/src/lib.rs`) and
confirm no function was added without a row.

## 5. Contract upgrade authorization

Because no contract can replace its own code today, record how an upgrade is
authorized and make sure it is implemented before the audit if upgrades are in
scope:

- [ ] Decide the mechanism: redeploy and repoint via `admin_registry`, or add
      an admin-only `upgrade(new_wasm_hash)` that calls
      `env.deployer().update_current_contract_wasm`.
- [ ] If an `upgrade` function is added: it requires the admin's authorization,
      is covered by a test that a non-admin is rejected, and emits an event.
- [ ] The admin account is a multisig or hardware-secured key; document the
      signers and threshold.
- [ ] A timelock or announcement period is defined for production upgrades.
- [ ] Storage layout changes are paired with a migration (see
      `core_game/src/state_migration.rs`) and a migration test.
- [ ] The `version()` function returns the new version after an upgrade.
- [ ] The release steps are written down and rehearsed on testnet.

## 6. Completion tracking

| Section | Owner | Status | Date |
| --- | --- | --- | --- |
| 1. Code documentation | | [ ] | |
| 2. Test coverage | | [ ] | |
| 3. Known limitations | | [ ] | |
| 4. Access control matrix | | [ ] | |
| 5. Upgrade authorization | | [ ] | |

The audit can be requested once every row is checked.
