//SERVICES
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reward } from './reward.entity';
import { ethers } from 'ethers';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class RewardService {
  private provider: ethers.JsonRpcProvider;
  private wallet: ethers.Wallet;
  private contract: ethers.Contract;

  constructor(
    @InjectRepository(Reward)
    private readonly rewardRepo: Repository<Reward>,
  ) {
    this.provider = new ethers.JsonRpcProvider(process.env.BLOCKCHAIN_RPC_URL);
    this.wallet = new ethers.Wallet(process.env.WALLET_PRIVATE_KEY, this.provider);
    
    const contractABI = [
      "function claimReward(address player, uint256 amount) external"
    ];
    
    this.contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, contractABI, this.wallet);
  }

  async addReward(playerAddress: string, amount: number) {
    const reward = this.rewardRepo.create({ playerAddress, amount });
    return this.rewardRepo.save(reward);
  }

  async getUnclaimedRewards(playerAddress: string) {
    return this.rewardRepo.find({ where: { playerAddress, claimed: false } });
  }

  async processReward(playerAddress: string) {
    const rewards = await this.getUnclaimedRewards(playerAddress);
    if (rewards.length === 0) throw new Error('No unclaimed rewards');

    const totalAmount = rewards.reduce((sum, reward) => sum + Number(reward.amount), 0);

    try {
      const tx = await this.contract.claimReward(playerAddress, ethers.parseEther(totalAmount.toString()));
      await tx.wait(); // Wait for transaction to complete

      await this.rewardRepo.update({ playerAddress, claimed: false }, { claimed: true });

      return { success: true, txHash: tx.hash };
    } catch (error) {
      throw new Error(`Reward claim failed: ${error.message}`);
    }
  }
}