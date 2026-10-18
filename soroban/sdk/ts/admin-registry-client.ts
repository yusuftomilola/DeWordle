import { nativeToScVal } from "@stellar/stellar-sdk";
import { Server } from "@stellar/stellar-sdk/rpc";
import type { ContractRegistry, SorobanNetworkConfig } from "./network";
import { resolveContractId } from "./registry";
import { CompatibilityGuard, type CompatibilityOptions } from "./contract-compat";
import { buildContractTx, simulateAndAssemble } from "./tx-builder";

export class AdminRegistryClient {
  private readonly server: Server;
  private readonly compat: CompatibilityGuard;

  constructor(
    private readonly contractId: string,
    private readonly network: SorobanNetworkConfig,
    compatibility?: CompatibilityOptions,
  ) {
    this.server = new Server(network.rpcUrl);
    this.compat = new CompatibilityGuard({
      contractName: "admin_registry",
      contractId,
      server: this.server,
      network,
      options: compatibility,
    });
  }

  static fromRegistry(
    network: SorobanNetworkConfig,
    registry: ContractRegistry,
    compatibility?: CompatibilityOptions,
  ) {
    return new AdminRegistryClient(resolveContractId(registry, "admin_registry"), network, compatibility);
  }

  async buildGetContractTx(sourcePublicKey: string, key: string) {
    await this.compat.ensure();
    const account = await this.server.getAccount(sourcePublicKey);
    const tx = await buildContractTx({
      server: this.server,
      source: account,
      network: this.network,
      contractId: this.contractId,
      method: "get_contract",
      args: [nativeToScVal(key, { type: "symbol" })],
    });

    return simulateAndAssemble({ server: this.server, tx });
  }
}
