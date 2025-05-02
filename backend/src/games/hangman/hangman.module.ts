import { Module } from '@nestjs/common';
import { HangmanService } from './hangman.service';
import { HangmanController } from './hangman.controller';
import { ScoreModule } from './score/score.module';
import { WordsService } from '../hangman/words/words.service';
import { WordsController } from '../hangman/words/words.controller';

@Module({
  imports: [ScoreModule],
  controllers: [HangmanController, WordsController],
  providers: [HangmanService, WordsService],
})
export class HangmanModule {}
