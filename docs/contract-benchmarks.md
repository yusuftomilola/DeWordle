<!-- markdownlint-disable MD013 -->

# Soroban contract benchmarks

How to measure, compare and reduce the cost of DeWordle contract calls.

## What is measured

Soroban charges every invocation against a *budget* with two main resources:

- **CPU instructions**: how much computation the call performs.
- **Memory bytes**: how much memory the host allocates for it.

The benchmarks read both from the test environment's budget
(`env.cost_estimate().budget()`) after resetting it, so each number covers a
single entry-point call and nothing else. The result is the cost the host
charges for the call itself; it does not include the transaction's inclusion
fee, the ledger-entry read/write fees or the network's resource-fee
surcharges, which you get from a transaction simulation (see
[Measuring on a network](#measuring-on-a-network)).

## Existing benchmark tests

| Contract | File | Entry points |
| --- | --- | --- |
| `core_game` | [`soroban/contracts/core_game/tests/gas_benchmarks.rs`](../soroban/contracts/core_game/tests/gas_benchmarks.rs) | `init`, `set_day_config`, `create_session`, `submit_guess`, `finalize_session`, `get_session` |
| `rewards` | [`soroban/contracts/rewards/tests/gas_benchmarks.rs`](../soroban/contracts/rewards/tests/gas_benchmarks.rs) | `init`, `set_emission`, `accrue`, `claim`, `balance_of` |

Each test also asserts a generous CPU ceiling, roughly ten times the baseline
below, so `cargo test` fails on a large regression but not on small changes
from an SDK upgrade. Other tests in
[`soroban/contracts/core_game/tests/`](../soroban/contracts/core_game/tests/)
cover correctness (`guess_eval_proptest.rs`) rather than cost.

## Running the benchmarks locally

Prerequisites: a stable Rust toolchain (see the
[Soroban testing guide](./SOROBAN_TESTING_GUIDE.md)).

```bash
# Every benchmark, one line per entry point
scripts/run-contract-benchmarks.sh

# One package
scripts/run-contract-benchmarks.sh core-game

# Or call cargo directly
cargo test --manifest-path soroban/Cargo.toml -p core-game --test gas_benchmarks -- --nocapture --test-threads=1
```

Output looks like:

```text
BENCH create_session         cpu=    107225 mem=   18968
```

## Baseline

Measured with `soroban-sdk` 22.0.11 in the test environment (one call per
test, default budget). Numbers are deterministic for a given SDK version and
code; update the table in the same pull request that intentionally changes a
function's cost.

### `core_game`

| Function | CPU instructions | Memory (bytes) |
| --- | ---: | ---: |
| `init` | 28,287 | 3,279 |
| `set_day_config` | 54,018 | 8,090 |
| `create_session` | 107,225 | 18,968 |
| `submit_guess` | 99,936 | 14,507 |
| `finalize_session` | 116,965 | 18,506 |
| `get_session` | 46,338 | 5,585 |

### `rewards`

| Function | CPU instructions | Memory (bytes) |
| --- | ---: | ---: |
| `init` | 22,232 | 2,582 |
| `set_emission` | 48,542 | 6,732 |
| `accrue` | 56,631 | 8,496 |
| `claim` | 57,082 | 9,394 |
| `balance_of` | 18,302 | 2,329 |

`achievements` and `admin_registry` have no benchmarks yet; add a
`tests/gas_benchmarks.rs` next to the ones above when you change them.

## Comparing before and after a change

1. On a clean checkout, run `scripts/run-contract-benchmarks.sh > before.txt`.
2. Apply your change and run it again into `after.txt`.
3. `diff before.txt after.txt`. Report the changed rows in your pull request
   and update the baseline tables above.

## Measuring on a network

The test budget is the right tool for comparing code changes. For the real
cost of a call (including ledger-entry fees) simulate the transaction against
a network and read the `minResourceFee` and `cost` fields of the result:

```bash
stellar contract invoke --id <CONTRACT_ID> --network testnet \
  --source <ACCOUNT> --sim-only -- get_session --session_id <ID>
```

`--sim-only` simulates without submitting. See
[Soroban local development](./SOROBAN_LOCAL_DEV.md) for setting up a network.

## Tips for reducing cost

- **Touch fewer ledger entries.** Each persistent read or write costs more
  than computation. Read an entry once, keep it in a local variable and write
  it back once (as `submit_guess` does with the session).
- **Keep stored values small.** Memory and fee grow with serialized size; prefer
  small integers and `BytesN<32>` hashes over strings.
- **Avoid unbounded loops** over storage or vectors. Bound them with a constant
  (for example `MAX_ATTEMPTS_LIMIT` in `core_game`).
- **Emit lean events.** Event topics and data are charged; publish only what
  the indexer needs.
- **Use the right storage type.** Temporary storage is cheaper than persistent
  for data that may expire; instance storage suits small, hot configuration.
- **Do cryptography off-chain when you can.** Verify signatures with
  `ed25519_verify` only where the contract must, because it is one of the most
  expensive host calls.
- **Build with the release profile** (`stellar contract build`), whose `opt-level`
  and LTO settings shrink the WASM and the cost of loading it.
