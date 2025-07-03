import { Injectable, Logger, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LeaderboardEntry } from './leaderboard-entry.entity';
import { User } from '../auth/entities/user.entity';
import { Game } from '../games/entities/game.entity';

@Injectable()
export class LeaderboardService {
  private readonly logger = new Logger(LeaderboardService.name);
  constructor(
    @InjectRepository(LeaderboardEntry)
    private leaderboardRepository: Repository<LeaderboardEntry>,
  ) {}

  async upsertEntry(user: User, game: Game, score: number, win: boolean) {
    if (!user) {
      this.logger.warn('Attempted to upsert leaderboard for guest session. Skipping.');
      return;
    }
    try {
      let entry = await this.leaderboardRepository.findOne({ where: { user, game } });
      if (!entry) {
        entry = this.leaderboardRepository.create({ user, game, totalScore: score, wins: win ? 1 : 0, totalSessions: 1 });
      } else {
        entry.totalScore += score;
        entry.wins += win ? 1 : 0;
        entry.totalSessions += 1;
      }
      return await this.leaderboardRepository.save(entry);
    } catch (error) {
      this.logger.error('Failed to upsert leaderboard entry', error.stack);
      throw new InternalServerErrorException('Could not update leaderboard');
    }
  }

  async getGameLeaderboard(game: Game, skip = 0, take = 20) {
    if (!game) throw new NotFoundException('Game not found');
    try {
      return await this.leaderboardRepository.find({
        where: { game },
        order: { totalScore: 'DESC', lastUpdated: 'DESC' },
        skip: Math.max(0, Number(skip)),
        take: Math.max(1, Math.min(Number(take), 100)), // limit page size
        relations: ['user'],
      });
    } catch (error) {
      this.logger.error('Failed to fetch game leaderboard', error.stack);
      throw new InternalServerErrorException('Could not fetch game leaderboard');
    }
  }

  async getGlobalLeaderboard(skip = 0, take = 20) {
    try {
      return await this.leaderboardRepository.createQueryBuilder('entry')
        .leftJoinAndSelect('entry.user', 'user')
        .select('entry.userId', 'userId')
        .addSelect('SUM(entry.totalScore)', 'totalScore')
        .addSelect('SUM(entry.wins)', 'wins')
        .addSelect('SUM(entry.totalSessions)', 'totalSessions')
        .addSelect('MAX(entry.lastUpdated)', 'lastUpdated')
        .groupBy('entry.userId')
        .orderBy('totalScore', 'DESC')
        .addOrderBy('lastUpdated', 'DESC')
        .offset(Math.max(0, Number(skip)))
        .limit(Math.max(1, Math.min(Number(take), 100)))
        .getRawMany();
    } catch (error) {
      this.logger.error('Failed to fetch global leaderboard', error.stack);
      throw new InternalServerErrorException('Could not fetch global leaderboard');
    }
  }
}
