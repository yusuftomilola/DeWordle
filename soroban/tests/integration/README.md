# Integration tests

Cross-contract scenarios for the foundation contracts. They live in the
`integration-tests` workspace crate (`soroban/tests`) and run with the rest of
the workspace.

```bash
cargo test --manifest-path soroban/Cargo.toml -p integration-tests
```

`cross_contract_harness.rs` deploys `core_game`, `rewards`, `achievements` and
`admin_registry` into one test environment and covers:

- the full game lifecycle (create a session, play to a win or loss, finalize,
  accrue and claim rewards, unlock an achievement), asserted as one expected
  state;
- streaks across consecutive days and nonce/finalize replay protection;
- registry wiring, missing wiring and double initialization.

The contracts do not call each other, so each step is a separate client call,
as the backend orchestrator would make it.
