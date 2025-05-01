import { Module } from '@nestjs/common';
import { DewordleModule } from './dewordle/dewordle.module';
import { SpellingBeeModule } from './spelling-bee/spelling-bee.module';
import { GamesController } from './games.controller';
import { HangmanModule } from './hangman/hangman.module';
import { PuzzleGeneratorService } from './spelling-bee/services/PuzzleGenerator.service';

@Module({
  imports: [DewordleModule, SpellingBeeModule, HangmanModule],
  providers: [PuzzleGeneratorService],
  controllers: [GamesController],
  exports: [PuzzleGeneratorService],
})
export class GamesModule {}
