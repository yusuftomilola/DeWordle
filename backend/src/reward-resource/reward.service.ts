import { Injectable, UseFilters } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reward } from './reward.entity';
import { ethers } from 'ethers/';
import * as dotenv from 'dotenv';
import {
  AllExceptionsFilter,
  BlockchainExceptionFilter,
  DatabaseExceptionFilter,
  ValidationExceptionFilter,
} from 'src/common/filters';
import { BlockchainException, DatabaseException } from 'src/common/exceptions';

dotenv.config();

@Injectable()
@UseFilters(
  AllExceptionsFilter,
  BlockchainExceptionFilter,
  DatabaseExceptionFilter,
  ValidationExceptionFilter,
)
export class RewardService {
  private provider: ethers.JsonRpcProvider;
  private wallet: ethers.Wallet;
  private contract: ethers.Contract;

  constructor(
    @InjectRepository(Reward)
    private readonly rewardRepo: Repository<Reward>,
  ) {
    this.provider = new ethers.JsonRpcProvider(process.env.BLOCKCHAIN_RPC_URL);
    this.wallet = new ethers.Wallet(
      process.env.WALLET_PRIVATE_KEY,
      this.provider,
    );

    const contractABI = [
      'function claimReward(address player, uint256 amount) external',
    ];

    this.contract = new ethers.Contract(
      process.env.CONTRACT_ADDRESS,
      contractABI,
      this.wallet,
    );
  }

  async addReward(playerAddress: string, amount: number) {
    try {
      const reward = this.rewardRepo.create({ playerAddress, amount });
      return await this.rewardRepo.save(reward);
    } catch (error) {
      throw new DatabaseException(`Failed to add reward: ${error.message}`);
    }
  }

  async getUnclaimedRewards(playerAddress: string) {
    try {
      return await this.rewardRepo.find({
        where: { playerAddress, claimed: false },
      });
    } catch (error) {
      throw new DatabaseException(
        `Failed to retrieve rewards: ${error.message}`,
      );
    }
  }

  async processReward(playerAddress: string) {
    const rewards = await this.getUnclaimedRewards(playerAddress);
    if (rewards.length === 0) throw new Error('No unclaimed rewards');

    const totalAmount = rewards.reduce(
      (sum, reward) => sum + Number(reward.amount),
      0,
    );

    try {
      const tx = await this.contract.claimReward(
        playerAddress,
        ethers.parseEther(totalAmount.toString()),
      );
      await tx.wait(); // Wait for transaction to complete

      await this.rewardRepo.update(
        { playerAddress, claimed: false },
        { claimed: true },
      );

      return { success: true, txHash: tx.hash };
    } catch (error) {
      throw new BlockchainException(`Reward claim failed: ${error.message}`);
    }
  }
}
