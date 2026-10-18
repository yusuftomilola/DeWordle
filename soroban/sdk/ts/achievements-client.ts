import { Address, nativeToScVal } from "@stellar/stellar-sdk";
import { Server } from "@stellar/stellar-sdk/rpc";
import type { ContractRegistry, SorobanNetworkConfig } from "./network";
import { resolveContractId } from "./registry";
import { CompatibilityGuard, type CompatibilityOptions } from "./contract-compat";
import { buildContractTx, simulateAndAssemble } from "./tx-builder";

export class AchievementsClient {
  private readonly server: Server;
  private readonly compat: CompatibilityGuard;

  constructor(
    private readonly contractId: string,
    private readonly network: SorobanNetworkConfig,
    compatibility?: CompatibilityOptions,
  ) {
    this.server = new Server(network.rpcUrl);
    this.compat = new CompatibilityGuard({
      contractName: "achievements",
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
    return new AchievementsClient(resolveContractId(registry, "achievements"), network, compatibility);
  }

  async buildGetUnlockedTx(sourcePublicKey: string, achievementId: string) {
    await this.compat.ensure();
    const account = await this.server.getAccount(sourcePublicKey);
    const tx = await buildContractTx({
      server: this.server,
      source: account,
      network: this.network,
      contractId: this.contractId,
      method: "get_unlocked",
      args: [new Address(sourcePublicKey).toScVal(), nativeToScVal(achievementId, { type: "symbol" })],
    });

    return simulateAndAssemble({ server: this.server, tx });
  }
}
