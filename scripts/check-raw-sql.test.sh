#!/usr/bin/env bash
# Self-test for scripts/check-raw-sql.sh using throw-away fixture trees.
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
CHECK="$HERE/check-raw-sql.sh"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

mkdir -p "$TMP/backend/src/migrations" "$TMP/scripts"
: > "$TMP/scripts/raw-sql-allowlist.txt"

expect() { # expect <exit-code> <description>
  local want="$1" desc="$2" got=0
  RAW_SQL_ALLOWLIST="$TMP/scripts/raw-sql-allowlist.txt" "$CHECK" "$TMP" >/dev/null 2>&1 || got=$?
  if [ "$got" -ne "$want" ]; then
    echo "FAIL: $desc (expected exit $want, got $got)"; exit 1
  fi
  echo "ok: $desc"
}

echo "export const ok = 1;" > "$TMP/backend/src/clean.ts"
expect 0 "clean tree passes"

echo 'await ds.query(`SELECT * FROM users WHERE id = ${id}`);' > "$TMP/backend/src/bad.ts"
expect 1 "interpolated .query( is flagged"

echo 'await ds.query(`SELECT * FROM users WHERE id = ${id}`);' > "$TMP/backend/src/bad.spec.ts"
rm "$TMP/backend/src/bad.ts"
expect 0 "spec files are ignored"

echo 'qb.where(`name = ${name}`);' > "$TMP/backend/src/qb.ts"
expect 1 "interpolated QueryBuilder where is flagged"
rm "$TMP/backend/src/qb.ts"

echo 'where: { id: Raw((a) => `${a} = 1`) }' > "$TMP/backend/src/raw.ts"
expect 1 "Raw() find operator is flagged"
rm "$TMP/backend/src/raw.ts"

echo "await qr.query('ALTER TABLE x');" > "$TMP/backend/src/migrations/001.ts"
expect 0 "migrations are ignored"

echo 'const r = ds.createQueryRunner();' > "$TMP/backend/src/runner.ts"
expect 1 "createQueryRunner is flagged"
echo 'backend/src/runner.ts|const r = ds.createQueryRunner();' > "$TMP/scripts/raw-sql-allowlist.txt"
expect 0 "an allowlisted line passes"
echo 'const r = ds.createQueryRunner(); // changed' > "$TMP/backend/src/runner.ts"
expect 1 "a modified allowlisted line is flagged again"

echo "all check-raw-sql tests passed"
