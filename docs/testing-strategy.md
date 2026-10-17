# Testing Strategy Guide

This document outlines the testing strategy for DeWordle, covering unit, integration, and end-to-end (E2E) layers, the tools used for each layer, file naming conventions, minimum coverage expectations, and concrete examples.

## Testing Pyramid

DeWordle follows a testing pyramid: a broad base of fast, isolated unit tests, a middle layer of integration tests, and a small top layer of high-value E2E tests. The goal is to catch regressions early while still exercising critical user flows end-to-end.

| Layer | Purpose | Scope | Speed | When to use |
|------|---------|-------|-------|-------------|
| **Unit** | Verify small, isolated functions, classes, and modules behave correctly. | Single function or module; dependencies mocked/stubbed. | Very fast | When testing pure logic, utilities, reducers, guards, or formatters. |
| **Integration** | Verify interactions between multiple components or services. | Multiple modules, contracts, or services working together (e.g. contract + client, or API + database). | Medium | When testing cross-module contracts, API endpoints with real dependencies in-memory, or contract-client flows. |
| **E2E** | Verify critical user journeys end-to-end in a real browser/environment. | Full application stack (frontend, backend, on-chain) or browser-based flows. | Slowest | When testing game-winning flows, wallet connection, or deployments. |

## Tool Choices

| Layer | Tool | Project | Notes |
|------|------|---------|-------|
| Unit (TypeScript) | [Vitest](https://vitest.dev/) | Frontend (`frontend/package.json`) | `jsdom` environment for component tests; globals enabled. Uses `vite-tsconfig-paths` and aliases. |
| Unit (TypeScript) | [Jest](https://jestjs.io/) | Backend (`backend/package.json`) | Configured in `backend/package.json` (`rootDir: "src"`, `testRegex: ".*\\.spec\\.ts$"`, `ts-jest`). Module alias `src/*` mapped to `<rootDir>/$1`. |
| Unit (Rust) | [cargo test](https://doc.rust-lang.org/cargo/commands/cargo-test.html) | Soroban contracts & crates (`soroban/`) | Native Rust testing. Snapshot-based tests use `cargo-insta` conventions where present (see `soroban/tests/` and per-contract test snapshots). |
| Integration | Jest (backend) | Backend | Integration tests live alongside unit specs; they may use in-memory DB fakes or mocked external services depending on the test. |
| Integration | Vitest (frontend) | Frontend | Integration tests focus on component composition, hooks, or lib modules (e.g. `src/lib/soroban`, `src/lib/stellar`) with mocked network dependencies. |
| Integration (Contracts) | `cargo test --workspace` | Soroban | Cross-contract integration tests live in `soroban/tests/integration/`. |
| E2E | [Playwright](https://playwright.dev/) | Root/E2E (`e2e/`) | `e2e/gameplay.spec.ts` exercises the core game win flow in the browser. Frontend also exposes `test:cross-browser` for broader browser coverage. |

## File Naming Conventions and Locations

| Layer | Extension | Location | Notes |
|------|-----------|----------|-------|
| Unit (TypeScript) | `*.spec.ts` | Co-located with source or under `__tests__/` | Backend follows `testRegex: ".*\\.spec\\.ts$"` in `src/`. Frontend unit tests are colocated (e.g. `src/components/__tests__/` or alongside components) and run by Vitest. |
| Integration (TypeScript) | `*.spec.ts` or `*.integration.spec.ts` | Same conventions; name can signal integration | The backend `test:ci` targets `src/indexer` specifically. Distinguish heavy integration tests from fast unit tests if needed. |
| E2E | `*.spec.ts` | `e2e/` directory at repo root | Playwright tests live in `e2e/` and are excluded from Vitest (`exclude: ['e2e/**']`). |
| Rust unit/integration | `*.rs` (modules) | Under `#[cfg(test)]` modules or `tests/` dirs | Contract unit tests are inline; integration tests live in `soroban/tests/integration/`. Snapshot files live in `soroban/contracts/*/test_snapshots/`. |

## Minimum Coverage Requirements

| Package/Surface | Requirement | Notes |
|----------------|-------------|-------|
| Backend (maintained surface) | No global coverage gate enforced by default | CI runs `npm run test:ci` for `src/indexer/` in the maintained backend surface. Coverage is reported via `test:cov` locally but not a hard blocker unless a workflow enforces it. |
| Frontend (wallet/Soroban) | No hard percentage enforced | CI targets `src/lib/stellar` and `src/lib/soroban` for the maintained surface. Focus on critical paths rather than chasing numbers. |
| Soroban contracts | Behavior-focused | Snapshot tests guard storage/events; new logic must have tests. No blanket line percentage is mandated. |
| New code paths (critical) | ≥ 80% unit coverage for pure logic | Treat as a guideline for non-trivial new utilities, guards, parsers, or validators. Use judgment for trivial wiring. |

## Running Tests Locally

| Surface | Command | Notes |
|---------|---------|-------|
| All workspace tests (TS) | `npm test` (root) | Runs backend tests via `npm run test --prefix backend`. Frontend unit tests: `npm test --prefix frontend`. |
| Backend unit+integration | `cd backend && npm run test` | Uses Jest in watch mode by default; `npm run test:ci` is CI-safe (no watchman, runInBand). |
| Backend (maintained indexer) | `cd backend && npm run test:ci -- src/indexer/` | The canonical check for the maintained backend surface. |
| Frontend unit | `cd frontend && npm test` or `npm run test:watch` | Vitest runs in CI with `vitest run`. |
| Frontend (maintained Stellar/Soroban) | `cd frontend && npx vitest run src/lib/stellar src/lib/soroban` | Mirrors the maintained surface check. |
| Soroban contracts/crates | `cd soroban && cargo test --workspace` | Runs all unit and integration tests. Use `make test` from `soroban/` if the Makefile is preferred. |
| E2E | `npx playwright test` from root (or `npm run test:e2e` at root if configured) | `e2e/gameplay.spec.ts` is the canonical example. Ensure the app is running or configured per Playwright setup. |
| Cross-browser (frontend) | `cd frontend && npm run test:cross-browser` | Runs Playwright cross-browser tests defined in the frontend config. |

## Example Test Patterns

### 1. Backend Unit Test (Jest)
```ts
// backend/src/common/filters/__tests__/http-exception.filter.spec.ts (example pattern)
import { HttpException } from '@nestjs/common';
import { HttpExceptionFilter } from '../http-exception.filter';

describe('HttpExceptionFilter', () => {
  it('should handle HttpException with default status', () => {
    const filter = new HttpExceptionFilter();
    const exception = new HttpException('Not found', 404);
    // ... arrange mock response and assert
  });
});
```
- Naming: `*.spec.ts`, colocated under `__tests__/` or next to source.
- Uses Jest + ts-jest, module alias `src/`.

### 2. Frontend Unit Test (Vitest)
```ts
// frontend/src/lib/stellar/__tests__/some-util.spec.ts (pattern)
import { describe, it, expect } from 'vitest';
import { formatAddress } from '../format-address';

describe('formatAddress', () => {
  it('shortens a long Stellar address', () => {
    expect(formatAddress('GBXVABCNVTJG5JQZIUNWUJH4QT3MPN2ZDAW2DA5BOMN2J5RFFSJ2D5P6')).toMatch(/G.*6$/);
  });
});
```
- Uses `jsdom` environment; globals are enabled.
- Aliased imports via `@/` or relative paths.

### 3. Rust Unit Test (inline)
```rust
#[cfg(test)]
mod tests {
  use super::*;

  #[test]
  fn init_sets_admin() {
    let env = Env::default();
    // ... setup and assertions
  }
}
```
- Inline in contract source (`soroban/contracts/*/src/lib.rs`).
- Uses standard `#[test]` with Soroban testutils.

### 4. Playwright E2E
```ts
// e2e/gameplay.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Full game win flow', () => {
  test('player types target word and wins', async ({ page }) => {
    await page.goto('/');
    const targetWord = 'CRANE';
    for (const letter of targetWord) await page.keyboard.press(letter);
    await page.keyboard.press('Enter');
    const winModal = page.getByRole('dialog');
    await expect(winModal).toBeVisible({ timeout: 5000 });
  });
});
```

## Notes
- Vitest excludes `e2e/**` from frontend unit tests; Playwright owns that directory.
- Backend `test:ci` is constrained to the maintained `src/indexer/` surface in CI, but locally you should run the full suite relevant to your changes.
- Snapshot updates (`make update-snapshots` in `soroban/`) must follow the [Snapshot Update Policy](../docs/SNAPSHOT_UPDATE_POLICY.md): review every changed snapshot, confirm it matches the intended contract change, and include snapshots in the same commit.
- Never assume a specific test framework exists; check the package.json/scripts for the surface you're modifying.
- Tests should be deterministic. Avoid time-based flakiness, prefer fixed fixtures, and mock external services for unit/integration layers.