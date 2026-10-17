#!/usr/bin/env bash
#
# Runs the Soroban gas benchmarks and prints one line per entry point.
#
#   scripts/run-contract-benchmarks.sh            # all contracts
#   scripts/run-contract-benchmarks.sh core-game  # one package
#
# See docs/contract-benchmarks.md.
set -euo pipefail

cd "$(dirname "$0")/../soroban"

packages=("$@")
if [ ${#packages[@]} -eq 0 ]; then
  packages=(core-game rewards)
fi

for pkg in "${packages[@]}"; do
  echo "== $pkg =="
  # --test-threads=1 keeps the BENCH lines in a stable order.
  cargo test -p "$pkg" --test gas_benchmarks -- --nocapture --test-threads=1 \
    | grep -E '^test .*BENCH|^BENCH|test result' || true
done
