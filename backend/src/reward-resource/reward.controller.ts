//CONTROLLER
import { Controller, Post, Get, Param, Body } from '@nestjs/common';
import { RewardService } from './reward.service';

@Controller('rewards')
export class RewardController {
  constructor(private readonly rewardService: RewardService) {}

  @Post('add')
  async addReward(@Body() body: { playerAddress: string; amount: number }) {
    return this.rewardService.addReward(body.playerAddress, body.amount);
  }

  @Get(':playerAddress')
  async getUnclaimed(@Param('playerAddress') playerAddress: string) {
    return this.rewardService.getUnclaimedRewards(playerAddress);
  }

  @Post('claim/:playerAddress')
  async claimReward(@Param('playerAddress') playerAddress: string) {
    return this.rewardService.processReward(playerAddress);
  }
}