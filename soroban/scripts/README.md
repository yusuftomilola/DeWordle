# Soroban Scripts

- `deploy/deploy-testnet.sh`: build + deploy flow scaffold.
- `invoke/invoke-core-game.sh`: manual invocation scaffold for local testing.
- `generate_wasm_checksums.sh`: compute a SHA-256 checksum for a compiled contract WASM.
- `verify_wasm_checksums.sh`: compare locally built WASM against CI-produced checksums.

These scripts are intentionally minimal for foundation phase and are designed for contributor extension.
