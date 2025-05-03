import { Module, forwardRef } from '@nestjs/common';
import { DictionaryModule } from 'src/dictionary/dictionary.module';
import { SpellingBeeController } from './spelling-bee.controller';
import { GamesModule } from '../games.module';
import { SpellingBeeStateService } from './spelling-bee-state.service';
// import { SpellingBeeService } from './spelling-bee.service';
import { LeaderboardModule } from 'src/games/dewordle/leaderboard/leaderboard.module';
import { ResultModule } from 'src/games/dewordle/result/result.module';
import { WordsModule } from 'src/games/dewordle/words/words.module';
import { WordValidatorService } from 'src/games/spelling-bee/providers/word-validator-service.service';

@Module({
  imports: [
    DictionaryModule,
    LeaderboardModule,
    ResultModule,
    WordsModule,
    forwardRef(() => GamesModule),
  ],
  providers: [
    WordValidatorService,
    SpellingBeeStateService,
    // SpellingBeeService,
  ],
  exports: [
    WordValidatorService,
    // SpellingBeeService,
    SpellingBeeStateService,
  ],
  controllers: [SpellingBeeController],
})
export class SpellingBeeModule {}
