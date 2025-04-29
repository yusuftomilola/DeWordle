import { Module } from '@nestjs/common';
import { DewordleModule } from './dewordle/dewordle.module';
import { SpellingBeeModule } from './spelling-bee/spelling-bee.module';
import { GamesController } from './games.controller';

@Module({
  imports: [DewordleModule, SpellingBeeModule],
  controllers: [GamesController],
})
export class GamesModule {}
