import { Module } from '@nestjs/common';
import { DewordleModule } from './dewordle/dewordle.module';
import { SpellingBeeModule } from './spelling-bee/spelling-bee.module';

@Module({
  imports: [DewordleModule, SpellingBeeModule],
})
export class GamesModule {}
