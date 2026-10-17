import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Account, TransactionBuilder, nativeToScVal, scValToNative } from "@stellar/stellar-sdk";
import { Server } from "@stellar/stellar-sdk/rpc";
import {
  buildContractTx,
  normalizeTxError,
  pollTransaction,
  simulateAndAssemble,
  submitSignedTx,
  submitTransaction,
} from "./tx-builder";
import { CONTRACT_IDS, SOURCE_KEY, TESTNET, resetRpcMocks, rpc } from "./testing/rpc-mock";

vi.mock("@stellar/stellar-sdk/rpc", async (importOriginal) =>
  (await import("./testing/rpc-mock")).withMockedRpc(await importOriginal<Record<string, unknown>>()),
);

const server = () => new Server(TESTNET.rpcUrl);
const source = () => new Account(SOURCE_KEY, "100");

/** Reads the contract call out of a built transaction. */
function decodeCall(tx: ReturnType<TransactionBuilder["build"]>) {
  const op = tx.operations[0] as unknown as {
    type: string;
    func: { invokeContract(): { functionName(): Buffer | string; args(): unknown[] } };
  };
  const invoke = op.func.invokeContract();
  return {
    type: op.type,
    method: invoke.functionName().toString(),
    args: invoke.args().map((a) => scValToNative(a as never)),
  };
}

beforeEach(() => resetRpcMocks());

describe("buildContractTx", () => {
  it("builds one invokeHostFunction operation with the method and encoded args", async () => {
    const tx = await buildContractTx({
      server: server(),
      source: source(),
      network: TESTNET,
      contractId: CONTRACT_IDS.core_game,
      method: "create_session",
      args: [nativeToScVal(SOURCE_KEY), nativeToScVal(7, { type: "u32" }), nativeToScVal(3, { type: "u32" })],
    });

    expect(tx.operations).toHaveLength(1);
    expect(decodeCall(tx)).toEqual({
      type: "invokeHostFunction",
      method: "create_session",
      args: [SOURCE_KEY, 7, 3],
    });
  });

  it("uses the network passphrase and a default fee of 100 stroops", async () => {
    const tx = await buildContractTx({
      server: server(),
      source: source(),
      network: TESTNET,
      contractId: CONTRACT_IDS.rewards,
      method: "claim",
    });
    expect(tx.networkPassphrase).toBe(TESTNET.passphrase);
    expect(tx.fee).toBe("100");
    expect(decodeCall(tx).args).toEqual([]);
  });

  it("honours an explicit fee", async () => {
    const tx = await buildContractTx({
      server: server(),
      source: source(),
      network: TESTNET,
      contractId: CONTRACT_IDS.rewards,
      method: "claim",
      fee: "5000",
    });
    expect(tx.fee).toBe("5000");
  });

  it("rejects an invalid contract id", async () => {
    await expect(
      buildContractTx({ server: server(), source: source(), network: TESTNET, contractId: "nope", method: "x" }),
    ).rejects.toThrow();
  });
});

describe("simulateAndAssemble", () => {
  const buildTx = () =>
    buildContractTx({ server: server(), source: source(), network: TESTNET, contractId: CONTRACT_IDS.core_game, method: "get" });

  it("simulates and returns the assembled transaction", async () => {
    const tx = await buildTx();
    const simulated = { id: "1", latestLedger: 1, events: [], transactionData: {}, minResourceFee: "10" };
    rpc.simulateTransaction.mockResolvedValueOnce(simulated);

    const result = await simulateAndAssemble({ server: server(), tx });

    expect(rpc.simulateTransaction).toHaveBeenCalledWith(tx);
    expect(result.simulated).toBe(simulated);
    expect(result.assembled).toMatchObject({ assembledFrom: tx, simulated });
  });

  it("throws a descriptive error when the simulation fails", async () => {
    const tx = await buildTx();
    rpc.simulateTransaction.mockResolvedValueOnce({ id: "1", latestLedger: 1, error: "HostError: Error(Contract, #7)" });
    await expect(simulateAndAssemble({ server: server(), tx })).rejects.toThrow(
      "Simulation failed: HostError: Error(Contract, #7)",
    );
  });

  it("propagates RPC transport errors", async () => {
    const tx = await buildTx();
    rpc.simulateTransaction.mockRejectedValueOnce(new Error("socket hang up"));
    await expect(simulateAndAssemble({ server: server(), tx })).rejects.toThrow("socket hang up");
  });
});

describe("submitTransaction", () => {
  const buildTx = () =>
    buildContractTx({ server: server(), source: source(), network: TESTNET, contractId: CONTRACT_IDS.core_game, method: "get" });

  it("returns the RPC response for accepted transactions", async () => {
    const tx = await buildTx();
    rpc.sendTransaction.mockResolvedValueOnce({ status: "PENDING", hash: "abc" });
    await expect(submitTransaction({ server: server(), tx })).resolves.toMatchObject({ status: "PENDING", hash: "abc" });
  });

  it("throws the result XDR for a rejected transaction", async () => {
    const tx = await buildTx();
    rpc.sendTransaction.mockResolvedValueOnce({ status: "ERROR", errorResult: { toXDR: () => "ERRXDR" } });
    await expect(submitTransaction({ server: server(), tx })).rejects.toThrow("ERRXDR");
  });

  it("falls back to a generic message when no result XDR is returned", async () => {
    const tx = await buildTx();
    rpc.sendTransaction.mockResolvedValueOnce({ status: "ERROR" });
    await expect(submitTransaction({ server: server(), tx })).rejects.toThrow("Transaction submit failed");
  });
});

describe("pollTransaction", () => {
  const result = (status: string) => ({ status, resultXdr: { toXDR: () => `${status}-XDR` } });

  afterEach(() => vi.useRealTimers());

  it("returns SUCCESS with the result XDR", async () => {
    rpc.getTransaction.mockResolvedValueOnce(result("SUCCESS"));
    await expect(pollTransaction({ server: server(), txHash: "h" })).resolves.toEqual({
      status: "SUCCESS",
      txHash: "h",
      resultXdr: "SUCCESS-XDR",
    });
  });

  it("returns FAILED with the error result XDR", async () => {
    rpc.getTransaction.mockResolvedValueOnce(result("FAILED"));
    await expect(pollTransaction({ server: server(), txHash: "h" })).resolves.toEqual({
      status: "FAILED",
      txHash: "h",
      errorResultXdr: "FAILED-XDR",
    });
  });

  it("returns NOT_FOUND immediately", async () => {
    rpc.getTransaction.mockResolvedValueOnce({ status: "NOT_FOUND" });
    await expect(pollTransaction({ server: server(), txHash: "h" })).resolves.toEqual({ status: "NOT_FOUND", txHash: "h" });
  });

  it("keeps polling while the transaction is pending, then returns the final status", async () => {
    vi.useFakeTimers();
    rpc.getTransaction
      .mockResolvedValueOnce({ status: "PENDING" })
      .mockResolvedValueOnce({ status: "PENDING" })
      .mockResolvedValueOnce(result("SUCCESS"));

    const promise = pollTransaction({ server: server(), txHash: "h", intervalMs: 1000 });
    await vi.advanceTimersByTimeAsync(2000);

    await expect(promise).resolves.toMatchObject({ status: "SUCCESS" });
    expect(rpc.getTransaction).toHaveBeenCalledTimes(3);
  });

  it("gives up with PENDING after the attempt limit", async () => {
    vi.useFakeTimers();
    rpc.getTransaction.mockResolvedValue({ status: "PENDING" });

    const promise = pollTransaction({ server: server(), txHash: "h", maxAttempts: 3, intervalMs: 500 });
    await vi.advanceTimersByTimeAsync(2000);

    await expect(promise).resolves.toEqual({ status: "PENDING", txHash: "h" });
    expect(rpc.getTransaction).toHaveBeenCalledTimes(3);
  });
});

describe("submitSignedTx", () => {
  const signedXdr = async () =>
    (
      await buildContractTx({ server: server(), source: source(), network: TESTNET, contractId: CONTRACT_IDS.core_game, method: "get" })
    ).toXDR();

  it("submits the signed XDR and polls to completion", async () => {
    rpc.sendTransaction.mockResolvedValueOnce({ status: "PENDING", hash: "tx1" });
    rpc.getTransaction.mockResolvedValueOnce({ status: "SUCCESS", resultXdr: { toXDR: () => "OK" } });

    const out = await submitSignedTx({ server: server(), signedXdr: await signedXdr() });

    expect(out).toEqual({ status: "SUCCESS", txHash: "tx1", resultXdr: "OK" });
    expect(rpc.getTransaction).toHaveBeenCalledWith("tx1");
  });

  it("rejects XDR that is not a transaction", async () => {
    await expect(submitSignedTx({ server: server(), signedXdr: "not-xdr" })).rejects.toThrow();
    expect(rpc.sendTransaction).not.toHaveBeenCalled();
  });

  it("surfaces a rejected submission as an error", async () => {
    rpc.sendTransaction.mockResolvedValueOnce({ status: "ERROR", hash: "tx2", errorResult: { toXDR: () => "E" } });
    await expect(submitSignedTx({ server: server(), signedXdr: await signedXdr() })).rejects.toThrow("E");
  });
});

describe("normalizeTxError", () => {
  it("decodes known contract error codes", () => {
    expect(normalizeTxError(new Error("HostError: Error(Contract, #7)"))).toContain("SessionNotFound");
    expect(normalizeTxError("Error(Contract, #14)")).toContain("ContractPaused");
  });

  it("flags unknown contract error codes", () => {
    expect(normalizeTxError("Error(Contract, #99)")).toContain("Unknown contract error code 99");
  });

  it("passes other errors through", () => {
    expect(normalizeTxError("Network timeout")).toBe("Network timeout");
    expect(normalizeTxError(new Error("boom"))).toBe("boom");
    expect(normalizeTxError({ message: "object error" })).toBe("object error");
  });

  it("handles values that are not errors", () => {
    expect(normalizeTxError(undefined)).toBe("Unknown transaction error");
    expect(normalizeTxError(42)).toBe("Unknown transaction error");
  });
});
