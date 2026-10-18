<!-- markdownlint-disable MD013 -->

# Glossary

Terms used in the DeWordle codebase and docs, from the game and from Soroban /
Stellar. Alphabetical; one or two sentences each.

| Term | Definition |
| --- | --- |
| Accrue | To add reward points to a player's balance in the `rewards` contract; admin-only and replay-protected by a nonce. |
| Achievement | A named milestone defined by an admin in the `achievements` contract and unlocked per player. |
| Admin registry | The `admin_registry` contract that stores contract addresses and role assignments for administrators. |
| Attempt | One guess within a session; a session allows `max_attempts` of them (at most 20). |
| Auth entry | A signed authorization that lets a contract call act on behalf of an address (`require_auth`). |
| Claim | A player's `claim` call that moves their accrued reward balance into their claimed total. |
| Commitment | A hash of a value published now and revealed later; the puzzle commitment in a day's config binds the answer without exposing it. |
| Contract ID | The `C...` address that identifies a deployed Soroban contract. |
| Core game | The `core_game` contract that manages days, sessions, guesses and streaks. |
| Day config | The per-day settings (puzzle commitment, attempt limit, closing time) an admin publishes with `set_day_config`. |
| Emission | The points a day's win or participation grants, set per day in the `rewards` contract. |
| Event | A record a contract publishes during a call (for example `session started`); the backend indexer reads events to build projections. |
| Fee bump | A transaction wrapper in which a sponsor pays the fee while the inner transaction's source account authorizes the call. |
| Footprint | The list of ledger entries a transaction will read and write, declared up front and enforced by the host. |
| Fuzzing | Feeding a function random or malformed input to look for panics; see `soroban/fuzz`. |
| Guess result | What `submit_guess` returns: the attempt number, an outcome code and whether the guess was correct. |
| Horizon | Stellar's classic HTTP API for accounts and transactions, separate from Soroban RPC. |
| Indexer | The backend component that ingests contract events and keeps read-model projections up to date. |
| Instance storage | Soroban storage shared by all entries of one contract instance and extended together; used for small, hot configuration. |
| Invocation | A single call to a contract function within a transaction. |
| Ledger | A numbered Stellar block; also the unit in which storage time-to-live is measured. |
| Nonce | A one-time number that makes a request unique so it cannot be replayed (session creation and reward accrual use them). |
| Outcome code | A numeric encoding of the per-letter result of a guess, produced by the backend and recorded on-chain. |
| Paused | A contract state, set by an admin, in which player-facing calls are rejected. |
| Persistent storage | Soroban storage for long-lived entries such as sessions and balances; each entry has its own TTL. |
| Player stats | Per-player win and rank figures kept by the `rewards` contract. |
| Projection | A read model derived from events, such as the session or leaderboard tables served by the backend. |
| RPC | The Soroban JSON-RPC service used to simulate and submit transactions and to read events and ledger entries. |
| Session | One player's play-through of a day's puzzle, identified by a 32-byte session ID and tracked on-chain. |
| Session ID | The hash derived from the player, day and nonce that identifies a session. |
| Simulation | A dry run of a transaction against the network that returns its result, resource usage and required footprint without submitting it. |
| Stellar Asset Contract (SAC) | The built-in Soroban contract that exposes a classic Stellar asset to smart contracts. |
| Streak | The number of consecutive days a player has finalized a session; the current and best values are stored per player. |
| Stroop | The smallest unit of XLM: one ten-millionth of a lumen. |
| Testnet | The public Stellar network used for development, with free test funds. |
| TTL (time to live) | The number of ledgers a storage entry stays available; it must be extended before it expires, or the entry is archived. |
| WASM | WebAssembly, the compiled form of a Soroban contract that is uploaded to the network. |
| XDR | External Data Representation, the binary format Stellar uses for transactions, ledger entries and contract values. |
