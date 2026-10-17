import { Account, Keypair, scValToNative } from "@stellar/stellar-sdk";
import type { Server } from "@stellar/stellar-sdk/rpc";
import type { SorobanNetworkConfig } from "./network";
import { buildContractTx, simulateAndAssemble } from "./tx-builder";

/** Version of this SDK build, compared against each contract's `min_sdk_version`. */
export const SDK_VERSION = "0.1.0";

export interface ContractMetadata {
  version: number;
  /** Hex-encoded SHA-256 of the contract's public ABI descriptor. */
  abiHash: string;
  minSdkVersion: string;
}

export interface CompatibilityOptions {
  /** Override the SDK version (tests, or apps pinning a build number). */
  sdkVersion?: string;
  /** Skip the on-chain check entirely. */
  skipCompatibilityCheck?: boolean;
}

export class IncompatibleContractError extends Error {
  constructor(
    readonly contractName: string,
    readonly sdkVersion: string,
    readonly minSdkVersion: string,
    readonly contractVersion: number,
  ) {
    super(
      `The ${contractName} contract (v${contractVersion}) requires SDK ${minSdkVersion} or newer, ` +
        `but this app uses ${sdkVersion}. Please refresh or update the app to continue.`,
    );
    this.name = "IncompatibleContractError";
  }
}

/** Returns <0, 0, >0 like a comparator; compares numeric dot-separated parts. */
export function compareSemver(a: string, b: string): number {
  const parse = (v: string) =>
    v
      .trim()
      .replace(/^v/, "")
      .split("-")[0]
      .split(".")
      .map((p) => Number.parseInt(p, 10) || 0);
  const pa = parse(a);
  const pb = parse(b);
  for (let i = 0; i < Math.max(pa.length, pb.length, 3); i++) {
    const diff = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (diff !== 0) return diff;
  }
  return 0;
}

export function parseContractMetadata(raw: unknown): ContractMetadata | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;
  const version = Number(obj["version"]);
  const sdk = obj["min_sdk_version"] ?? obj["minSdkVersion"];
  const hash = obj["abi_hash"] ?? obj["abiHash"];
  if (!Number.isFinite(version) || typeof sdk !== "string") return null;
  const abiHash =
    typeof hash === "string"
      ? hash
      : hash instanceof Uint8Array
        ? Array.from(hash, (b) => b.toString(16).padStart(2, "0")).join("")
        : "";
  return { version, abiHash, minSdkVersion: sdk };
}

/** Throws IncompatibleContractError when the SDK is older than the contract allows. */
export function assertCompatible(
  contractName: string,
  metadata: ContractMetadata,
  sdkVersion: string = SDK_VERSION,
): void {
  if (compareSemver(sdkVersion, metadata.minSdkVersion) < 0) {
    throw new IncompatibleContractError(
      contractName,
      sdkVersion,
      metadata.minSdkVersion,
      metadata.version,
    );
  }
}

/**
 * Reads `get_metadata()` through a simulation. Returns null when the contract
 * has no such function (deployed before metadata existed); transport errors
 * propagate.
 */
export async function fetchContractMetadata(params: {
  server: Server;
  network: SorobanNetworkConfig;
  contractId: string;
}): Promise<ContractMetadata | null> {
  // Reads need a funded-looking source only for sequence numbers; a throwaway works.
  const source = new Account(Keypair.random().publicKey(), "0");
  const tx = await buildContractTx({
    server: params.server,
    source,
    network: params.network,
    contractId: params.contractId,
    method: "get_metadata",
  });
  try {
    const { simulated } = await simulateAndAssemble({ server: params.server, tx });
    const retval = (simulated as { result?: { retval: Parameters<typeof scValToNative>[0] } })
      .result?.retval;
    return retval ? parseContractMetadata(scValToNative(retval)) : null;
  } catch (error) {
    if (error instanceof Error && /^Simulation failed/.test(error.message)) return null;
    throw error;
  }
}

/** Checks a contract once per client and caches a passing result. */
export class CompatibilityGuard {
  private passed: Promise<void> | null = null;

  constructor(
    private readonly params: {
      contractName: string;
      contractId: string;
      server: Server;
      network: SorobanNetworkConfig;
      options?: CompatibilityOptions;
      fetchMetadata?: typeof fetchContractMetadata;
    },
  ) {}

  ensure(): Promise<void> {
    const { options, contractName, contractId, server, network } = this.params;
    if (options?.skipCompatibilityCheck) return Promise.resolve();
    if (!this.passed) {
      const fetcher = this.params.fetchMetadata ?? fetchContractMetadata;
      this.passed = fetcher({ server, network, contractId }).then((metadata) => {
        if (metadata) assertCompatible(contractName, metadata, options?.sdkVersion);
      });
      // A failed check (incompatible or transient) must be retried next call.
      this.passed.catch(() => {
        this.passed = null;
      });
    }
    return this.passed;
  }
}
