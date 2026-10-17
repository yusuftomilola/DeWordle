#!/usr/bin/env bash
# Verifies locally built contract WASM against a checksum manifest produced by CI.
#
# Usage:
#   ./scripts/verify_wasm_checksums.sh [manifest] [wasm_dir]
#
# `manifest` is the `wasm-checksums.txt` artifact downloaded from the
# "WASM Checksum Verifier" workflow. Each line uses the sha256sum format
# "<sha256>  <path>". The script rebuilds nothing; run `make build-wasm`
# first so that `${wasm_dir}` contains the artifacts to compare.
set -euo pipefail

MANIFEST="${1:-wasm-checksums.txt}"
WASM_DIR="${2:-target/wasm32-unknown-unknown/release}"

if [[ ! -f "$MANIFEST" ]]; then
  echo "Checksum manifest not found: $MANIFEST" >&2
  exit 1
fi

if [[ ! -d "$WASM_DIR" ]]; then
  echo "WASM directory not found: $WASM_DIR (run 'make build-wasm' first)" >&2
  exit 1
fi

sha256_of() {
  if command -v sha256sum >/dev/null 2>&1; then
    sha256sum "$1" | awk '{print $1}'
  else
    shasum -a 256 "$1" | awk '{print $1}'
  fi
}

status=0
matched=0
checked=0

while read -r expected ref; do
  [[ -z "${expected:-}" ]] && continue
  name="$(basename "$ref")"
  local_file="$WASM_DIR/$name"
  checked=$((checked + 1))

  if [[ ! -f "$local_file" ]]; then
    echo "MISSING  $name (expected $expected)"
    status=1
    continue
  fi

  actual="$(sha256_of "$local_file")"
  if [[ "$actual" == "$expected" ]]; then
    echo "OK       $name"
    matched=$((matched + 1))
  else
    echo "MISMATCH $name"
    echo "  expected $expected"
    echo "  actual   $actual"
    status=1
  fi
done < "$MANIFEST"

echo "---"
echo "Verified $matched/$checked artifacts."

if [[ $status -ne 0 ]]; then
  echo "Reproducible build verification FAILED." >&2
  exit 1
fi

echo "All artifacts match the CI-produced checksums."
