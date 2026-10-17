import { beforeEach, describe, expect, it, vi } from "vitest";
import { AchievementsClient } from "./achievements-client";
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

describe("AchievementsClient", () => {
  it("connects to the network's RPC URL", () => {
    new AchievementsClient(CONTRACT_IDS.achievements, TESTNET);
    expect(rpc.constructedWith).toEqual([TESTNET.rpcUrl]);
  });

  it("builds from a registry and fails clearly when the id is missing", () => {
    expect(AchievementsClient.fromRegistry(TESTNET, REGISTRY)).toBeInstanceOf(AchievementsClient);
    const registry = { ...REGISTRY, contracts: { ...REGISTRY.contracts, achievements: "" } };
    expect(() => AchievementsClient.fromRegistry(TESTNET, registry)).toThrow(/Missing contract id for achievements/);
  });

  it("buildGetUnlockedTx encodes the player and achievement id for get_unlocked", async () => {
    rpc.simulateTransaction.mockResolvedValueOnce(okSimulation);
    const result = await new AchievementsClient(CONTRACT_IDS.achievements, TESTNET).buildGetUnlockedTx(
      SOURCE_KEY,
      "first_win",
    );

    expect(rpc.getAccount).toHaveBeenCalledWith(SOURCE_KEY);
    expect(decodeCall(rpc.simulateTransaction.mock.calls[0][0])).toEqual({
      type: "invokeHostFunction",
      method: "get_unlocked",
      args: [SOURCE_KEY, "first_win"],
      types: ["scvAddress", "scvSymbol"],
    });
    expect(result.assembled).toBeDefined();
  });

  it("buildGetUnlockedTx reports a failed simulation", async () => {
    rpc.simulateTransaction.mockResolvedValueOnce({ id: "1", latestLedger: 1, error: "Error(Contract, #5)" });
    await expect(
      new AchievementsClient(CONTRACT_IDS.achievements, TESTNET).buildGetUnlockedTx(SOURCE_KEY, "missing"),
    ).rejects.toThrow("Simulation failed");
  });

  it("buildGetUnlockedTx reports an unknown account", async () => {
    rpc.getAccount.mockRejectedValueOnce(new Error("account not found"));
    await expect(
      new AchievementsClient(CONTRACT_IDS.achievements, TESTNET).buildGetUnlockedTx(SOURCE_KEY, "x"),
    ).rejects.toThrow("account not found");
  });
});
