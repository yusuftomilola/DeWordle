import { Module, forwardRef } from '@nestjs/common';
import { HangmanService } from './hangman.service';
import { HangmanController } from './hangman.controller';
import { HangmanStateService } from './hangman-state.service';
import { GamesModule } from '../games.module';
import { ScoreModule } from './score/score.module';

@Module({
  controllers: [HangmanController],
  providers: [HangmanService, HangmanStateService],
  exports: [HangmanService, HangmanStateService],
  imports: [ScoreModule, forwardRef(() => GamesModule)],
})
export class HangmanModule {}
