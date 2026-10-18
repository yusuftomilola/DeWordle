<!-- markdownlint-disable MD013 -->
# SQL Injection Audit

Audit of every place where backend code builds SQL, and the CI check that
keeps new raw SQL from slipping in unreviewed. Line numbers refer to the
commit that introduced this document; the CI check matches on file and source
text, so they are informational.

## Summary

| Category | Count | Result |
| --- | --- | --- |
| Raw SQL strings in application code (`.query(`, `createQueryRunner`, `Raw()`) | 0 remaining | Three `.query(` calls (constant or already parameterised) were found and moved to QueryBuilder (see Findings) |
| QueryBuilder usages | 8 files | All user-controlled values are bound parameters (`:name`); no string interpolation or concatenation |
| Repository `find*` usages | many | Parameterised by TypeORM |
| Migrations | 11 files | DDL with constant text only; excluded from the CI check |

No injectable query was found. The audit still replaced the raw statements
so that "no raw SQL in application code" can be enforced mechanically.

## Method

1. Search for raw execution APIs:
   `grep -rnE "\.query\(|createQueryRunner|\bRaw\(|\$queryRaw|sql\`" backend/src backend/scripts`.
2. Search for interpolation inside QueryBuilder clauses
   (`where`, `andWhere`, `orderBy`, `groupBy`, `select`, `from`, ...).
3. Read every QueryBuilder chain and confirm each value that can come from a
   request is passed through a parameter object, and that `ORDER BY`, `LIMIT`
   and `OFFSET` values are constants or clamped numbers.

## Findings

### Raw SQL that was replaced

| Location | Before | After | Risk |
| --- | --- | --- | --- |
| `backend/src/indexer/projections/cursor.service.ts:83-88` (`resetProjections`) | `manager.query('DELETE FROM session_projections')` | `createQueryBuilder().delete().from(SessionProjectionEntity).execute()` | None (constant); replaced for consistency |
| `backend/scripts/reset-indexer.ts:31-44` | `dataSource.query(...)` with `$1`/`$2` placeholders, and a constant `DELETE` | `createQueryBuilder().delete().from(...)` with `:network` / `:streamKey` parameters | None (already parameterised); replaced for consistency |

### QueryBuilder usage (all parameterised)

| Location | Dynamic input | How it is bound |
| --- | --- | --- |
| `backend/src/user/user-stats.repository.ts:53-59` | `userId` | `.where('stats.userId = :userId', { userId })` |
| `backend/src/user/user-stats.repository.ts:90-101` | `userId` | `.where('stats.userId = :userId', { userId })` |
| `backend/src/user/user-stats.repository.ts:113-122` | `userId`, `limit` | `:userId`; `limit` is clamped to 1..100 and passed to `.take()` |
| `backend/src/leaderboard/leaderboard.service.ts:67-79` | `skip`, `take` | Numbers clamped (`Math.max` / `Math.min`) before `.offset()` / `.limit()`; constant `ORDER BY` |
| `backend/src/common/audit/audit.service.ts:70-80` | `since` | `:since` and `:...actions` (constant list) |
| `backend/src/indexer/audit-trail.service.ts:60-76` | `action`, `actor`, `network`, `limit`, `offset` | `:action`, `:actor`, `:network`; `limit` and `offset` clamped numbers |
| `backend/src/game-sessions/game-sessions.service.ts:126-131` | `guestId` | `:guestId` inside the JSON path comparison `session.metadata->>'guestId' = :guestId` |
| `backend/src/game-sessions/game-sessions.service.ts:168-175` | `sessionId`, `guestId` | `:sessionId`, `:guestId` |
| `backend/src/utils/word-seed.service.ts:123-127` | random offset | Server-generated number passed to `.skip()` / `.take()` |
| `backend/src/indexer/projections/cursor.service.ts:85-88` | none | Constant delete |

### Migrations

`backend/src/migrations/*.ts` execute DDL through `queryRunner.query(...)`
with constant text. Nothing in them concatenates runtime input. They are
excluded from the CI check; reviewers should still reject any migration that
interpolates values.

## CI check

`scripts/check-raw-sql.sh` scans `backend/src` and `backend/scripts` (excluding
migrations and spec files) for:

- `.query(`, `createQueryRunner`, `Raw(`, `$queryRaw` / `$executeRaw` and
  tagged `sql` templates;
- template-literal interpolation (`${...}`) inside QueryBuilder clauses.

Any hit that is not listed in `scripts/raw-sql-allowlist.txt` fails the
`SQL Injection Audit` workflow. An allowlist entry is the exact string
`<path>|<trimmed line>`, so changing the line re-triggers review. The check is
a coarse grep: it reports new raw SQL for human review and does not prove a
query is safe.

The script has a self-test, `scripts/check-raw-sql.test.sh`, which runs in the
same workflow.

### Allowlist

| Entry | Why it is allowed |
| --- | --- |
| `backend/src/indexer/audit-trail.controller.ts:44` | False positive: `auditService.query({...})` is an application method that builds a parameterised QueryBuilder (see above), not a database call |

## Guidelines for new code

- Use repository methods or QueryBuilder, and pass every value as a named
  parameter.
- Never build `ORDER BY` / column names from request input. Map allowed values
  through a lookup table.
- Clamp numeric `LIMIT` / `OFFSET` values.
- If raw SQL is unavoidable, use `$1`-style placeholders, add it to the
  allowlist with a justification, and add a row to this document.
