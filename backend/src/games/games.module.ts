import { Module } from '@nestjs/common';
import { DewordleModule } from './dewordle/dewordle.module';
import { SpellingBeeModule } from './spelling-bee/spelling-bee.module';
import { GamesController } from './games.controller';
import { HangmanModule } from './hangman/hangman.module';
import { PuzzleGeneratorService } from './spelling-bee/services/PuzzleGenerator.service';
import { DictionaryService } from '../dictionary/dictionary.service';

@Module({
  imports: [DewordleModule, SpellingBeeModule, HangmanModule],
  providers: [PuzzleGeneratorService, DictionaryService],
  controllers: [GamesController],
  exports: [PuzzleGeneratorService, DictionaryService],
})
export class GamesModule {}
