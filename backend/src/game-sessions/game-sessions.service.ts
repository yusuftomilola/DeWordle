import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GameSession } from './entities/game-session.entity';
import { Game } from '../games/entities/game.entity';
import { CreateSessionDto } from './dto/create-session.dto';
import { User } from '../auth/entities/user.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { LeaderboardService } from '../leaderboard/leaderboard.service';
import { WordsService } from '../dewordle/words/words.service';
import { CreateGuessDto } from './dto/create-guess.dto';

@Injectable()
export class GameSessionsService {
  constructor(
    @InjectRepository(GameSession)
    private sessionRepo: Repository<GameSession>,
    @InjectRepository(Game)
    private gameRepo: Repository<Game>,
    private eventEmitter: EventEmitter2,
    private leaderboardService: LeaderboardService,
    private wordService: WordsService,
  ) {}

  async create(createDto: CreateSessionDto, user: User | null) {
    // Validate game exists
    const game = await this.gameRepo.findOne({
      where: { id: createDto.gameId },
    });
    if (!game) throw new NotFoundException('Game not found');

    // Validate score for guest sessions (prevent abuse)
    if (!user && createDto.score < 0) {
      throw new BadRequestException('Invalid score for guest session');
    }

    const { word: solution } = await this.wordService.getRandomWord();

    // Create session with user or null for guest
    const session = this.sessionRepo.create({
      ...createDto,
      game,
      ...(user ? { user } : {}),
      solution,
    });

    const saved = await this.sessionRepo.save(session);

    // Update leaderboard only for authenticated users
    // Guest sessions are excluded from leaderboard and stats
    if (user) {
      const win = false; // You may want to determine win logic based on session/score
      await this.leaderboardService.upsertEntry(
        user,
        game,
        createDto.score,
        win,
      );
    }

    // Emit event for both authenticated and guest sessions
    this.eventEmitter.emit('session.completed', saved);

    return saved;
  }

  /**
   * Get sessions for a specific user or guest
   * @param user - User entity for authenticated users, null for guests
   * @param guestId - Guest identifier for anonymous sessions
   */
  async getUserSessions(user: User | null, guestId?: string) {
    if (user) {
      // Return authenticated user sessions
      return await this.sessionRepo.find({
        where: { user },
        relations: ['game'],
        order: { playedAt: 'DESC' },
      });
    } else if (guestId) {
      // Return guest sessions by guestId in metadata using query builder
      return await this.sessionRepo
        .createQueryBuilder('session')
        .leftJoinAndSelect('session.game', 'game')
        .where('session.user IS NULL')
        .andWhere("session.metadata->>'guestId' = :guestId", { guestId })
        .orderBy('session.playedAt', 'DESC')
        .getMany();
    }

    return [];
  }

  /**
   * Attempt a guess for a specific session
   * @param sessionId   - Session ID
   * @param guess       - User's guess
   * @param user        - User entity for authenticated users, null for guests
   */
  async guess(
    sessionId: GameSession['id'],
    guess: CreateGuessDto['guess'],
    user: User | null,
    guestId?: string,
  ) {
    if (!user && !guestId) {
      throw new BadRequestException('GuestId is required for guest sessions');
    }
    // Validate Session Exists
    const session = await (user
      ? this.sessionRepo.findOne({
          where: { id: sessionId, user },
        })
      : this.sessionRepo
          .createQueryBuilder('session')
          .where('session.id = :sessionId', { sessionId })
          .andWhere('session.user IS NULL')
          .andWhere("session.metadata->>'guestId' = :guestId", { guestId })
          .getOne());

    if (!session) throw new NotFoundException('Session not found');

    return session;
  }
}
