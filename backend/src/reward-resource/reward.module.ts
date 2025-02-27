//MODULE
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reward } from './reward.entity';
import { RewardService } from './reward.service';
import { RewardController } from './reward.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Reward])],
  providers: [RewardService],
  controllers: [RewardController],
})
export class RewardModule {}