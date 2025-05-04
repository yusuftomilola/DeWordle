import { Module, forwardRef } from '@nestjs/common';
import { LeaderboardModule } from './leaderboard/leaderboard.module';
import { ResultModule } from './result/result.module';
import { WordsModule } from './words/words.module';
import { GamesModule } from '../games.module';
import { DewordleController } from './dewordle.controller';
import { DewordleStateService } from './dewordle-state.service';
import { DewordleService } from './dewordle.service';
import { GamesService } from '../games.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Game } from '../entities/game.entity';
import { WordsService } from './words/words.service';

@Module({
  imports: [
    LeaderboardModule,
    ResultModule,
    WordsModule,
    forwardRef(() => GamesModule),
    TypeOrmModule.forFeature([Game]),
  ],
  controllers: [DewordleController],
  providers: [
    DewordleService,
    DewordleStateService,
    GamesService,
    WordsService,
  ],
  exports: [DewordleService, DewordleStateService, GamesService, WordsService],
})
export class DewordleModule {}
