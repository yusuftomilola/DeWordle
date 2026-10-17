import { vi } from "vitest";
import { Keypair, StrKey } from "@stellar/stellar-sdk";
import type { SorobanNetworkConfig, ContractRegistry } from "../network";

/** Shared mocks for the Soroban RPC `Server`; reset them in `beforeEach`. */
export const rpc = {
  constructedWith: [] as string[],
  getAccount: vi.fn(),
  simulateTransaction: vi.fn(),
  sendTransaction: vi.fn(),
  getTransaction: vi.fn(),
};

export function resetRpcMocks() {
  rpc.constructedWith.length = 0;
  for (const fn of [rpc.getAccount, rpc.simulateTransaction, rpc.sendTransaction, rpc.getTransaction]) {
    fn.mockReset();
  }
}

/**
 * For use inside `vi.mock("@stellar/stellar-sdk/rpc", ...)`: swaps `Server`
 * for a stub that forwards to the shared mocks above and replaces
 * `assembleTransaction` with one that records what it assembled.
 */
export function withMockedRpc<T extends Record<string, unknown>>(actual: T): T {
  class MockServer {
    constructor(url: string) {
      rpc.constructedWith.push(url);
    }
    getAccount = (...args: unknown[]) => rpc.getAccount(...args);
    simulateTransaction = (...args: unknown[]) => rpc.simulateTransaction(...args);
    sendTransaction = (...args: unknown[]) => rpc.sendTransaction(...args);
    getTransaction = (...args: unknown[]) => rpc.getTransaction(...args);
  }
  return {
    ...actual,
    Server: MockServer,
    assembleTransaction: (tx: unknown, simulated: unknown) => ({
      build: () => ({ assembledFrom: tx, simulated }),
    }),
  };
}

export const TESTNET: SorobanNetworkConfig = {
  name: "testnet",
  rpcUrl: "https://rpc.test.invalid",
  passphrase: "Test SDF Network ; September 2015",
};

export const SOURCE_KEY = Keypair.fromRawEd25519Seed(Buffer.alloc(32, 5)).publicKey();
export const OTHER_KEY = Keypair.fromRawEd25519Seed(Buffer.alloc(32, 6)).publicKey();

const contract = (byte: number) => StrKey.encodeContract(Buffer.alloc(32, byte));
export const CONTRACT_IDS = {
  admin_registry: contract(1),
  core_game: contract(2),
  rewards: contract(3),
  achievements: contract(4),
};

export const REGISTRY: ContractRegistry = { network: "testnet", contracts: CONTRACT_IDS };

/** A successful simulation result carrying `retval` (an ScVal) like the real RPC returns. */
export function simulationSuccess(retval?: unknown) {
  return { id: "1", latestLedger: 1, events: [], result: retval === undefined ? undefined : { retval, auth: [] } };
}

/** An account object like `server.getAccount` returns. */
export async function account(publicKey: string = SOURCE_KEY) {
  const { Account } = await import("@stellar/stellar-sdk");
  return new Account(publicKey, "100");
}
