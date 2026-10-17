import { scValToNative } from "@stellar/stellar-sdk";

/** Reads the contract method and decoded arguments out of a built transaction. */
export function decodeCall(tx: unknown) {
  const op = (tx as { operations: unknown[] }).operations[0] as {
    type: string;
    func: { invokeContract(): { functionName(): Buffer | string; contractAddress(): unknown; args(): unknown[] } };
  };
  const invoke = op.func.invokeContract();
  return {
    type: op.type,
    method: invoke.functionName().toString(),
    args: invoke.args().map((a) => scValToNative(a as never)),
    /** XDR type of each argument, e.g. `scvAddress`, `scvU32`, `scvBytes`. */
    types: invoke.args().map((a) => (a as { switch(): { name: string } }).switch().name),
  };
}
