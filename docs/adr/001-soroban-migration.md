# ADR 001: Soroban Migration Strategy

## Status
Accepted

## Context
DeWordle's original on-chain surface targeted Starknet, written in Cairo. As the
product grew, three pressures made the Cairo stack costly to maintain:

1. **Ecosystem alignment.** The player-facing wallet flow depends on Freighter
   and the Stellar Wallets Kit, and the player base is concentrated in the
   Stellar ecosystem. Bridging gameplay to Soroban removes an entire class of
   cross-chain friction.
2. **Tooling and hiring.** Rust and the Soroban SDK have a far larger talent
   pool and a more mature testing/storybook workflow (snapshot tests,
   `soroban-sdk` test utilities) than Cairo at the time of the decision.
3. **Cost and finality.** Soroban's fee model and fast finality suited the
   short-lived, high-frequency session writes that Wordle-style play produces.

The foundation phase needed a migration strategy that maximised contributor
parallelism while keeping protocol risk low. The full contract boundary detail
lives in [Soroban Foundation Architecture](../SOROBAN_FOUNDATION_ARCHITECTURE.md).

## Decision
Migrate the on-chain game surface from Cairo/Starknet to **Stellar Soroban**,
using a phased, projection-backed approach:

1. **Rebuild the protocol in modular Soroban contracts** (`core_game`,
   `rewards`, `achievements`, `admin_registry`) rather than a monolithic port.
2. **Keep `core_game` authoritative** for session state transitions and streak
   accounting; rewards and tournaments are deferred to later waves.
3. **Move the backend to an indexer/projection role.** The backend no longer
   owns gameplay; it ingests Soroban events via RPC and serves read models.
4. **Introduce a shared TypeScript SDK** (`soroban/sdk/ts/`) as the single
   integration surface for frontend and backend consumers.
5. **Adopt replay-safe ingest identifiers** `(network, txHash, eventIndex)` for
   all projections so re-indexing is idempotent.
6. **Roll out per network** (local sandbox, testnet, then mainnet) behind
   registry-driven contract IDs in `soroban/config/contracts.<network>.json`.

## Considered Alternatives
| Alternative | Pros | Cons | Outcome |
|-------------|------|------|---------|
| Stay on Cairo/Starknet and incrementally harden | No rewrite; existing audits stay valid | Detached from the Stellar wallet ecosystem; smaller talent pool; keeps cross-chain bridging cost | Rejected |
| Monolithic port of the existing contract to Soroban | Fastest single-contract deliverable | Reintroduces the coupling the foundation is meant to remove; blocks parallel work | Rejected |
| Off-chain-only gameplay with no contracts | Simplest to ship | Loses verifiable, trust-minimised game state; contradicts the product direction | Rejected |
| Modular Soroban contracts with an indexer and shared SDK (chosen) | Parallel workstreams; clear authority boundaries; verifiable state | More upfront scaffolding; requires an event indexing layer | Accepted |

## Consequences
- Contributors can work in parallel across contracts, SDK, frontend, and the
  indexer because the boundaries are explicit.
- Protocol-critical transitions are centralised in `core_game` early, which
  reduces the surface that needs auditing as features land.
- The backend gains a new operational responsibility: reliable event ingestion
  and projection maintenance (including a dead-letter path for failed events).
- Legacy Cairo/Starknet surfaces are retained only until the Soroban path
  reaches parity, then removed; see the [Stellar Migration Guide](../STELLAR_MIGRATION.md)
  for the cutover walkthrough.
- Rewards and tournaments are intentionally deferred, so early releases ship a
  smaller, higher-confidence feature set.

## References
- [Soroban Foundation Architecture](../SOROBAN_FOUNDATION_ARCHITECTURE.md)
- [Stellar Migration Guide](../STELLAR_MIGRATION.md)
- [Backend Indexer Foundation](../BACKEND_INDEXER_FOUNDATION.md)
- [ADR 0001: Soroban Foundation Boundaries](./0001-soroban-foundation-boundaries.md)
