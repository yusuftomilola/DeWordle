import { beforeEach, describe, expect, it, vi } from "vitest";
import { RewardsClient } from "./rewards-client";
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

describe("RewardsClient", () => {
  it("connects to the network's RPC URL", () => {
    new RewardsClient(CONTRACT_IDS.rewards, TESTNET);
    expect(rpc.constructedWith).toEqual([TESTNET.rpcUrl]);
  });

  it("builds from a registry using the rewards entry", async () => {
    rpc.simulateTransaction.mockResolvedValueOnce(okSimulation);
    const client = RewardsClient.fromRegistry(TESTNET, REGISTRY);
    await client.buildClaimTx(SOURCE_KEY);
    const tx = rpc.simulateTransaction.mock.calls[0][0];
    expect(decodeCall(tx).method).toBe("claim");
  });

  it("fails clearly when the registry has no rewards id", () => {
    const registry = { ...REGISTRY, contracts: { ...REGISTRY.contracts, rewards: "" } };
    expect(() => RewardsClient.fromRegistry(TESTNET, registry)).toThrow(/Missing contract id for rewards/);
  });

  it("buildClaimTx encodes the claiming player for claim", async () => {
    rpc.simulateTransaction.mockResolvedValueOnce(okSimulation);
    const result = await new RewardsClient(CONTRACT_IDS.rewards, TESTNET).buildClaimTx(SOURCE_KEY);

    expect(rpc.getAccount).toHaveBeenCalledWith(SOURCE_KEY);
    expect(decodeCall(rpc.simulateTransaction.mock.calls[0][0])).toEqual({
      type: "invokeHostFunction",
      method: "claim",
      args: [SOURCE_KEY],
      types: ["scvAddress"],
    });
    expect(result.assembled).toBeDefined();
  });

  it("buildClaimTx reports a failed simulation", async () => {
    rpc.simulateTransaction.mockResolvedValueOnce({ id: "1", latestLedger: 1, error: "Error(Contract, #4)" });
    await expect(new RewardsClient(CONTRACT_IDS.rewards, TESTNET).buildClaimTx(SOURCE_KEY)).rejects.toThrow(
      "Simulation failed: Error(Contract, #4)",
    );
  });

  it("buildClaimTx reports an unknown account", async () => {
    rpc.getAccount.mockRejectedValueOnce(new Error("account not found"));
    await expect(new RewardsClient(CONTRACT_IDS.rewards, TESTNET).buildClaimTx(SOURCE_KEY)).rejects.toThrow("account not found");
  });
});
