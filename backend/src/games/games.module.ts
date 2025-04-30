import { Module } from '@nestjs/common';
import { DewordleModule } from './dewordle/dewordle.module';
import { SpellingBeeModule } from './spelling-bee/spelling-bee.module';
import { GamesController } from './games.controller';
import { HangmanModule } from './hangman/hangman.module';

@Module({
  imports: [DewordleModule, SpellingBeeModule, HangmanModule],
  controllers: [GamesController],
})
export class GamesModule {}
