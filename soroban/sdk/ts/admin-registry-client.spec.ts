import { beforeEach, describe, expect, it, vi } from "vitest";
import { AdminRegistryClient } from "./admin-registry-client";
import { decodeCall } from "./testing/decode";
import { CONTRACT_IDS, REGISTRY, SOURCE_KEY, TESTNET, account, resetRpcMocks, rpc } from "./testing/rpc-mock";

vi.mock("@stellar/stellar-sdk/rpc", async (importOriginal) =>
  (await import("./testing/rpc-mock")).withMockedRpc(await importOriginal<Record<string, unknown>>()),
);

const okSimulation = { id: "1", latestLedger: 1, events: [], transactionData: {}, minResourceFee: "1" };

beforeEach(async () => {
  resetRpcMocks();
  rpc.getAccount.mockResolvedValue(await account());
});

describe("AdminRegistryClient", () => {
  it("connects to the network's RPC URL", () => {
    new AdminRegistryClient(CONTRACT_IDS.admin_registry, TESTNET);
    expect(rpc.constructedWith).toEqual([TESTNET.rpcUrl]);
  });

  it("builds from a registry and fails clearly when the id is missing", () => {
    expect(AdminRegistryClient.fromRegistry(TESTNET, REGISTRY)).toBeInstanceOf(AdminRegistryClient);
    const registry = { ...REGISTRY, contracts: { ...REGISTRY.contracts, admin_registry: "" } };
    expect(() => AdminRegistryClient.fromRegistry(TESTNET, registry)).toThrow(/Missing contract id for admin_registry/);
  });

  it("buildGetContractTx encodes the registry key for get_contract", async () => {
    rpc.simulateTransaction.mockResolvedValueOnce(okSimulation);
    const result = await new AdminRegistryClient(CONTRACT_IDS.admin_registry, TESTNET).buildGetContractTx(
      SOURCE_KEY,
      "core_game",
    );

    expect(decodeCall(rpc.simulateTransaction.mock.calls[0][0])).toEqual({
      type: "invokeHostFunction",
      method: "get_contract",
      args: ["core_game"],
      types: ["scvSymbol"],
    });
    expect(result.assembled).toBeDefined();
  });

  it("buildGetContractTx reports an unregistered key (failed simulation)", async () => {
    rpc.simulateTransaction.mockResolvedValueOnce({ id: "1", latestLedger: 1, error: "Error(Contract, #3)" });
    await expect(
      new AdminRegistryClient(CONTRACT_IDS.admin_registry, TESTNET).buildGetContractTx(SOURCE_KEY, "nope"),
    ).rejects.toThrow("Simulation failed: Error(Contract, #3)");
  });

  it("buildGetContractTx reports an unknown account", async () => {
    rpc.getAccount.mockRejectedValueOnce(new Error("account not found"));
    await expect(
      new AdminRegistryClient(CONTRACT_IDS.admin_registry, TESTNET).buildGetContractTx(SOURCE_KEY, "x"),
    ).rejects.toThrow("account not found");
  });
});
