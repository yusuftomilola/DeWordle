# Soroban Workspace

Foundational Soroban workspace for DeWordle migration.

## Layout
- `contracts/`: Soroban contract crates
- `crates/`: shared reusable libraries
- `sdk/ts/`: TypeScript SDK foundation
- `scripts/`: deployment and invocation scripts
- `tests/integration/`: cross-contract integration tests
- `config/`: network and contract registry config

## Build
```bash
cd soroban
cargo check --workspace
```

## Developer Commands
```bash
cd soroban
./scripts/setup.sh
make fmt
make check
make test
make build-wasm
```

## Reproducible WASM Builds
Contract WASM is expected to build bit-for-bit identically for the same source,
`Cargo.lock`, and toolchain. The pinned toolchain version is set in
`.github/workflows/wasm-checksum.yml` (`RUST_VERSION`) and mirrors the known-good
version from `toolchain-matrix.yml`.

The `WASM Checksum Verifier` workflow builds every contract, records the build
environment (Rust, Cargo, and Soroban SDK versions plus the commit SHA), and
uploads two artifacts: `wasm-checksums.txt` and `wasm-build-env.txt`.

To verify a local build against the CI-produced checksums:

```bash
cd soroban
make build-wasm
# Download wasm-checksums.txt from the "WASM Checksum Verifier" run, then:
./scripts/verify_wasm_checksums.sh wasm-checksums.txt
```

The script recomputes the SHA-256 of each local artifact and fails if any
checksum differs or an expected contract is missing. A mismatch means the local
toolchain, `Cargo.lock`, or source differs from the audited build. Always review
`wasm-build-env.txt` alongside the checksums before deploying.

## Contract Registry
Contract IDs per network are managed in `config/contracts.<network>.json`.
