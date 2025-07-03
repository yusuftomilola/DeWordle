import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GameSession } from './entities/game-session.entity';
import { Game } from 'src/games/entities/game.entity';
import { CreateSessionDto } from './dto/create-session.dto';
import { User } from 'src/auth/entities/user.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { LeaderboardService } from '../leaderboard/leaderboard.service';

@Injectable()
export class GameSessionsService {
  constructor(
    @InjectRepository(GameSession)
    private sessionRepo: Repository<GameSession>,
    @InjectRepository(Game)
    private gameRepo: Repository<Game>,
    private eventEmitter: EventEmitter2,
    private leaderboardService: LeaderboardService,
  ) {}

  async create(createDto: CreateSessionDto, user: User | null) {
    const game = await this.gameRepo.findOne({
      where: { id: createDto.gameId },
    });
    if (!game) throw new NotFoundException('Game not found');

    const session = this.sessionRepo.create({
      ...createDto,
      game,
      ...(user ? { user } : {}),
    });

    const saved = await this.sessionRepo.save(session);

    // Update leaderboard only for logged-in users
    if (user) {
      const win = false; // You may want to determine win logic based on session/score
      await this.leaderboardService.upsertEntry(user, game, createDto.score, win);
    }

    this.eventEmitter.emit('session.completed', saved);
    return saved;
  }
}
