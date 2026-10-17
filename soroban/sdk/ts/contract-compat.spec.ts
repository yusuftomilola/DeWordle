/**
 * Unit tests for the SDK/contract compatibility check.
 *
 * Run:
 *   npx tsx soroban/sdk/ts/contract-compat.spec.ts
 */
import {
  CompatibilityGuard,
  IncompatibleContractError,
  SDK_VERSION,
  assertCompatible,
  compareSemver,
  parseContractMetadata,
  type ContractMetadata,
} from "./contract-compat.js";
import { NETWORKS } from "./network.js";

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    passed++;
  } else {
    failed++;
    console.error(`  FAIL: ${message}`);
  }
}

function assertEqual<T>(actual: T, expected: T, message: string) {
  assert(JSON.stringify(actual) === JSON.stringify(expected), `${message} (got ${JSON.stringify(actual)})`);
}

async function rejects(p: Promise<unknown>): Promise<Error | null> {
  try {
    await p;
    return null;
  } catch (e) {
    return e as Error;
  }
}

const meta = (minSdkVersion: string, version = 3): ContractMetadata => ({
  version,
  abiHash: "ab".repeat(32),
  minSdkVersion,
});

async function main() {
  console.log("compareSemver orders numeric parts, not strings");
  assert(compareSemver("0.1.0", "0.1.0") === 0, "equal");
  assert(compareSemver("0.2.0", "0.1.9") > 0, "minor wins");
  assert(compareSemver("0.10.0", "0.9.0") > 0, "10 > 9 numerically");
  assert(compareSemver("1.0", "1.0.0") === 0, "missing patch is 0");
  assert(compareSemver("v1.2.3-rc.1", "1.2.3") === 0, "prerelease tag ignored");
  assert(compareSemver("0.0.9", "0.1.0") < 0, "older");

  console.log("parseContractMetadata handles scValToNative output");
  assertEqual(
    parseContractMetadata({ version: 3, abi_hash: Buffer.from("ab".repeat(32), "hex"), min_sdk_version: "0.1.0" }),
    meta("0.1.0"),
    "snake_case with Buffer hash",
  );
  assertEqual(parseContractMetadata({ version: 2, abiHash: "ff", minSdkVersion: "1.0.0" }), { version: 2, abiHash: "ff", minSdkVersion: "1.0.0" }, "camelCase");
  assert(parseContractMetadata(null) === null, "null rejected");
  assert(parseContractMetadata({ version: "x", min_sdk_version: "1.0.0" }) === null, "bad version rejected");
  assert(parseContractMetadata({ version: 1 }) === null, "missing sdk version rejected");

  console.log("assertCompatible");
  assertCompatible("core_game", meta("0.1.0"), "0.1.0");
  assertCompatible("core_game", meta("0.1.0"), "0.2.0");
  const err = await rejects(
    (async () => assertCompatible("core_game", meta("0.2.0", 4), "0.1.0"))(),
  );
  assert(err instanceof IncompatibleContractError, "throws IncompatibleContractError");
  assert(
    !!err && err.message.includes("core_game") &&
      err.message.includes("0.2.0") &&
      err.message.includes("0.1.0") &&
      /update the app/i.test(err.message),
    "message names contract, both versions and what to do",
  );

  console.log("CompatibilityGuard checks once, caches success, retries after failure");
  let calls = 0;
  const server = {} as never;
  const base = { contractName: "rewards", contractId: "C1", server, network: NETWORKS.testnet };

  const ok = new CompatibilityGuard({
    ...base,
    options: { sdkVersion: "0.1.0" },
    fetchMetadata: async () => (calls++, meta("0.1.0")),
  });
  await ok.ensure();
  await ok.ensure();
  assertEqual(calls, 1, "metadata fetched once for a compatible contract");

  const legacy = new CompatibilityGuard({ ...base, fetchMetadata: async () => null });
  assert((await rejects(legacy.ensure())) === null, "contract without get_metadata is allowed");

  let attempt = 0;
  const flaky = new CompatibilityGuard({
    ...base,
    options: { sdkVersion: "0.1.0" },
    fetchMetadata: async () => {
      attempt++;
      if (attempt === 1) throw new Error("rpc down");
      return meta("0.1.0");
    },
  });
  assert((await rejects(flaky.ensure()))?.message === "rpc down", "transport failure surfaces");
  await Promise.resolve(); // let the cache reset run
  assert((await rejects(flaky.ensure())) === null, "next call retries and passes");

  const old = new CompatibilityGuard({
    ...base,
    options: { sdkVersion: "0.1.0" },
    fetchMetadata: async () => meta("0.3.0"),
  });
  assert((await rejects(old.ensure())) instanceof IncompatibleContractError, "old SDK is rejected");

  let skipped = 0;
  const skip = new CompatibilityGuard({
    ...base,
    options: { skipCompatibilityCheck: true },
    fetchMetadata: async () => (skipped++, meta("9.9.9")),
  });
  await skip.ensure();
  assertEqual(skipped, 0, "skipCompatibilityCheck does not fetch");

  assert(/^\d+\.\d+\.\d+$/.test(SDK_VERSION), "SDK_VERSION is semver");

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
}

void main();
