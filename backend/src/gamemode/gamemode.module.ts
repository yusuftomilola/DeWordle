import { Module } from '@nestjs/common';
import { GamemodeService } from './gamemode.service';
import { GamemodeController } from './gamemode.controller';

@Module({
  controllers: [GamemodeController],
  providers: [GamemodeService],
})
export class GamemodeModule {}
