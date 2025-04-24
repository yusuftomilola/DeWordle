import { Module } from '@nestjs/common';
import { LeaderboardModule } from './leaderboard/leaderboard.module';
import { ResultModule } from './result/result.module';
import { WordsModule } from './words/words.module';

@Module({
  imports: [LeaderboardModule, ResultModule, WordsModule],
})
export class DewordleModule {}
