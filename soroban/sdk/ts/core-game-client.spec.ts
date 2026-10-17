import { beforeEach, describe, expect, it, vi } from "vitest";
import { nativeToScVal } from "@stellar/stellar-sdk";
import { CoreGameClient, generateEphemeralSigner } from "./core-game-client";
import { decodeCall } from "./testing/decode";
import { CONTRACT_IDS, OTHER_KEY, REGISTRY, SOURCE_KEY, TESTNET, account, resetRpcMocks, rpc } from "./testing/rpc-mock";

vi.mock("@stellar/stellar-sdk/rpc", async (importOriginal) =>
  (await import("./testing/rpc-mock")).withMockedRpc(await importOriginal<Record<string, unknown>>()),
);

const makeClient = () => new CoreGameClient({ contractId: CONTRACT_IDS.core_game, network: TESTNET });

const sentTx = () => rpc.simulateTransaction.mock.calls[0][0];

/** Makes the simulation return `native` as the contract's return value. */
function simulateReturning(native: unknown, scType?: string) {
  rpc.simulateTransaction.mockResolvedValueOnce({
    id: "1",
    latestLedger: 1,
    events: [],
    transactionData: {},
    minResourceFee: "1",
    result: { retval: nativeToScVal(native, scType ? ({ type: scType } as never) : undefined), auth: [] },
  });
}

beforeEach(async () => {
  resetRpcMocks();
  rpc.getAccount.mockResolvedValue(await account());
});

describe("CoreGameClient construction", () => {
  it("connects to the network's RPC URL and exposes the contract id", () => {
    const client = makeClient();
    expect(rpc.constructedWith).toEqual([TESTNET.rpcUrl]);
    expect(client.contractId).toBe(CONTRACT_IDS.core_game);
  });

  it("builds from a registry using the core_game entry", () => {
    const client = CoreGameClient.fromRegistry(TESTNET, REGISTRY);
    expect(client.contractId).toBe(CONTRACT_IDS.core_game);
  });

  it("fails clearly when the registry has no core_game id", () => {
    const registry = { ...REGISTRY, contracts: { ...REGISTRY.contracts, core_game: "  " } };
    expect(() => CoreGameClient.fromRegistry(TESTNET, registry)).toThrow(/Missing contract id for core_game/);
  });
});

describe("buildCreateSessionTx", () => {
  it("encodes player, day id and nonce for create_session", async () => {
    simulateReturning(undefined);
    await makeClient().buildCreateSessionTx(SOURCE_KEY, 42, 3);

    expect(rpc.getAccount).toHaveBeenCalledWith(SOURCE_KEY);
    expect(decodeCall(sentTx())).toEqual({
      type: "invokeHostFunction",
      method: "create_session",
      args: [SOURCE_KEY, 42, 3],
      // The contract takes (Address, u32, u32); a plain string or u64 would be rejected.
      types: ["scvAddress", "scvU32", "scvU32"],
    });
  });

  it("returns the simulated and assembled transactions", async () => {
    simulateReturning(undefined);
    const result = await makeClient().buildCreateSessionTx(SOURCE_KEY, 1, 0);
    expect(result.simulated).toBeDefined();
    expect(result.assembled).toBeDefined();
  });

  it("reports a failed simulation", async () => {
    rpc.simulateTransaction.mockResolvedValueOnce({ id: "1", latestLedger: 1, error: "Error(Contract, #6)" });
    await expect(makeClient().buildCreateSessionTx(SOURCE_KEY, 1, 0)).rejects.toThrow("Simulation failed: Error(Contract, #6)");
  });

  it("reports an unknown source account", async () => {
    rpc.getAccount.mockRejectedValueOnce(new Error("account not found"));
    await expect(makeClient().buildCreateSessionTx(SOURCE_KEY, 1, 0)).rejects.toThrow("account not found");
    expect(rpc.simulateTransaction).not.toHaveBeenCalled();
  });
});

describe("buildSubmitGuessTx", () => {
  const input = {
    player: OTHER_KEY,
    sessionId: "ab".repeat(32),
    guessCommitment: "cd".repeat(32),
    outcomeCode: 2,
    isCorrect: true,
  };

  it("encodes every guess field for submit_guess", async () => {
    simulateReturning(undefined);
    await makeClient().buildSubmitGuessTx(SOURCE_KEY, input);

    const call = decodeCall(sentTx());
    expect(call.method).toBe("submit_guess");
    expect(call.types).toEqual(["scvAddress", "scvBytes", "scvBytes", "scvU32", "scvBool"]);
    expect(call.args[0]).toBe(OTHER_KEY);
    expect(Buffer.from(call.args[1] as Uint8Array).toString("hex")).toBe(input.sessionId);
    expect(Buffer.from(call.args[2] as Uint8Array).toString("hex")).toBe(input.guessCommitment);
    expect(call.args.slice(3)).toEqual([2, true]);
  });

  it("uses the signer as the transaction source", async () => {
    simulateReturning(undefined);
    await makeClient().buildSubmitGuessTx(SOURCE_KEY, input);
    expect(sentTx().source).toBe(SOURCE_KEY);
  });

  it("reports a failed simulation", async () => {
    rpc.simulateTransaction.mockResolvedValueOnce({ id: "1", latestLedger: 1, error: "Error(Contract, #10)" });
    await expect(makeClient().buildSubmitGuessTx(SOURCE_KEY, input)).rejects.toThrow(/Simulation failed/);
  });
});

describe("getDayConfig", () => {
  it("calls get_day_config with a u32 day id and parses snake_case fields", async () => {
    simulateReturning(
      { day_id: 5, puzzle_commitment: "0xabc", max_attempts: 6, closes_at: 1700000000, published: true },
    );

    const config = await makeClient().getDayConfig(5);

    expect(decodeCall(sentTx())).toMatchObject({ method: "get_day_config", args: [5], types: ["scvU32"] });
    expect(config).toEqual({
      dayId: 5,
      puzzleCommitment: "0xabc",
      maxAttempts: 6,
      closesAt: 1700000000,
      published: true,
    });
  });

  it("returns null when the simulation has no result", async () => {
    simulateReturning(undefined);
    expect(await makeClient().getDayConfig(5)).toBeNull();
  });

  it("returns null when the call fails", async () => {
    rpc.simulateTransaction.mockResolvedValueOnce({ id: "1", latestLedger: 1, error: "Error(Contract, #3)" });
    expect(await makeClient().getDayConfig(99)).toBeNull();
  });

  it("returns null when the RPC throws", async () => {
    rpc.simulateTransaction.mockRejectedValueOnce(new Error("rpc down"));
    expect(await makeClient().getDayConfig(1)).toBeNull();
  });

  it("simulates from a throwaway account, not the contract address", async () => {
    simulateReturning(undefined);
    await makeClient().getDayConfig(1);
    expect(rpc.getAccount).not.toHaveBeenCalled();
    expect(sentTx().source).toMatch(/^G[A-Z2-7]{55}$/);
  });

  it("returns null for a payload that is not an object", async () => {
    simulateReturning(7, "u32");
    expect(await makeClient().getDayConfig(1)).toBeNull();
  });
});

describe("getSession", () => {
  const raw = {
    id: "s1",
    player: OTHER_KEY,
    day_id: 9,
    attempts_used: 2,
    max_attempts: 6,
    status: "Won",
    finalized: false,
    started_at: 100,
    updated_at: 200,
  };

  it("encodes the hex session id as bytes and parses the session", async () => {
    simulateReturning(raw);
    const sessionId = "0f".repeat(32);

    const session = await makeClient().getSession(sessionId);

    const call = decodeCall(sentTx());
    expect(call.method).toBe("get_session");
    expect(call.types).toEqual(["scvBytes"]);
    expect(Buffer.from(call.args[0] as Uint8Array).toString("hex")).toBe(sessionId);
    expect(session).toEqual({
      id: "s1",
      player: OTHER_KEY,
      dayId: 9,
      attemptsUsed: 2,
      maxAttempts: 6,
      status: "Won",
      finalized: false,
      startedAt: 100,
      updatedAt: 200,
    });
  });

  it("accepts camelCase fields and defaults the status to InProgress", async () => {
    simulateReturning({ id: "s2", player: SOURCE_KEY, dayId: 1, attemptsUsed: 0, maxAttempts: 6, finalized: false });
    const session = await makeClient().getSession("00".repeat(32));
    expect(session).toMatchObject({ id: "s2", dayId: 1, status: "InProgress" });
  });

  it("returns null when not found, failing or malformed", async () => {
    simulateReturning(undefined);
    expect(await makeClient().getSession("00".repeat(32))).toBeNull();

    rpc.simulateTransaction.mockResolvedValueOnce({ id: "1", latestLedger: 1, error: "Error(Contract, #7)" });
    expect(await makeClient().getSession("00".repeat(32))).toBeNull();

    simulateReturning(1, "u32");
    expect(await makeClient().getSession("00".repeat(32))).toBeNull();
  });
});

describe("parseGuessResult", () => {
  const client = makeClient();

  it("parses snake_case and camelCase payloads", async () => {
    expect(await client.parseGuessResult({ attempt_no: 3, outcome_code: 1, is_correct: false })).toEqual({
      attemptNo: 3,
      outcomeCode: 1,
      isCorrect: false,
    });
    expect(await client.parseGuessResult({ attemptNo: 1, outcomeCode: 2, isCorrect: true })).toEqual({
      attemptNo: 1,
      outcomeCode: 2,
      isCorrect: true,
    });
  });

  it("returns null for malformed payloads", async () => {
    expect(await client.parseGuessResult(null)).toBeNull();
    expect(await client.parseGuessResult("text")).toBeNull();
    expect(await client.parseGuessResult({ attempt_no: "x", outcome_code: 1 })).toBeNull();
    expect(await client.parseGuessResult({ attempt_no: 1, outcome_code: "y" })).toBeNull();
  });
});

describe("generateEphemeralSigner", () => {
  it("returns a fresh keypair each time", () => {
    const a = generateEphemeralSigner();
    const b = generateEphemeralSigner();
    expect(a.publicKey()).toMatch(/^G[A-Z2-7]{55}$/);
    expect(a.publicKey()).not.toBe(b.publicKey());
  });
});
