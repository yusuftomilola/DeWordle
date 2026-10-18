#!/usr/bin/env bash
# Flags raw SQL usage in backend application code so every new occurrence gets
# a security review (SQL injection audit, docs/SQL_INJECTION_AUDIT.md).
#
# A match is OK only if "<path>|<trimmed line>" appears in
# scripts/raw-sql-allowlist.txt. Migrations (schema DDL) and spec files are
# not scanned.
#
# Usage: scripts/check-raw-sql.sh [root-dir]   (default: repository root)
set -euo pipefail

ROOT="${1:-$(cd "$(dirname "$0")/.." && pwd)}"
ALLOWLIST="${RAW_SQL_ALLOWLIST:-$ROOT/scripts/raw-sql-allowlist.txt}"

PATTERNS=(
  '\.query\('                                  # DataSource/EntityManager/QueryRunner raw SQL
  'createQueryRunner'                          # manual query runners
  '\bRaw\('                                    # TypeORM Raw() find operator
  '\$(queryRaw|executeRaw)'                    # Prisma-style raw helpers
  'sql`'                                       # tagged SQL templates
  '\b(where|andWhere|orWhere|orderBy|addOrderBy|groupBy|having|select|addSelect|from)\(\s*`[^`]*\$\{'  # interpolation in QueryBuilder
)

SEARCH_DIRS=()
for d in backend/src backend/scripts; do
  [ -d "$ROOT/$d" ] && SEARCH_DIRS+=("$ROOT/$d")
done
if [ "${#SEARCH_DIRS[@]}" -eq 0 ]; then
  echo "check-raw-sql: no backend directories under $ROOT" >&2
  exit 2
fi

found=0
for pattern in "${PATTERNS[@]}"; do
  while IFS= read -r hit; do
    [ -z "$hit" ] && continue
    file="${hit%%:*}"
    rest="${hit#*:}"
    line="${rest#*:}"
    rel="${file#"$ROOT"/}"
    trimmed="$(printf '%s' "$line" | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//')"
    key="$rel|$trimmed"
    if [ -f "$ALLOWLIST" ] && grep -Fxq -- "$key" <(grep -v '^[[:space:]]*#' "$ALLOWLIST"); then
      continue
    fi
    echo "RAW SQL: $rel:${rest%%:*}: $trimmed"
    found=1
  done < <(grep -rnE "$pattern" "${SEARCH_DIRS[@]}" \
    --include='*.ts' --include='*.js' \
    --exclude='*.spec.ts' --exclude='*.test.ts' \
    --exclude-dir=migrations --exclude-dir=node_modules --exclude-dir=dist || true)
done

if [ "$found" -ne 0 ]; then
  cat >&2 <<'MSG'

New raw SQL needs a security review. Prefer the TypeORM repository or
QueryBuilder API with bound parameters (:name). If raw SQL is unavoidable and
every value is parameterised, add "<path>|<trimmed line>" to
scripts/raw-sql-allowlist.txt with a comment explaining why, and record it in
docs/SQL_INJECTION_AUDIT.md.
MSG
  exit 1
fi
echo "check-raw-sql: no unreviewed raw SQL found"
