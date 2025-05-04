import { Module, forwardRef } from '@nestjs/common';
import { HangmanService } from './hangman.service';
import { HangmanController } from './hangman.controller';
import { HangmanStateService } from './hangman-state.service';
import { GamesModule } from '../games.module';
import { ScoreModule } from './score/score.module';
import { WordsService } from '../hangman/words/words.service';
import { WordsController } from '../hangman/words/words.controller';

@Module({

  providers: [HangmanService, HangmanStateService, WordsService],
  exports: [HangmanService, HangmanStateService],
  imports: [ScoreModule, forwardRef(() => GamesModule)],
  controllers: [HangmanController, WordsController],

})
export class HangmanModule {}
