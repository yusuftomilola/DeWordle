import { Module } from '@nestjs/common';
import { GameSessionsController } from './game-sessions.controller';
import { GameSessionsService } from './game-sessions.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameSession } from './entities/game-session.entity';
import { Game } from '../games/entities/game.entity';
import { LeaderboardModule } from '../leaderboard/leaderboard.module';
import { WordsModule } from '../dewordle/words/words.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([GameSession, Game]),
    LeaderboardModule,
    WordsModule,
  ],
  controllers: [GameSessionsController],
  providers: [GameSessionsService],
})
export class GameSessionsModule {}
