import { Test, TestingModule } from '@nestjs/testing';
import { GameSessionsService } from './game-sessions.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { GameSession } from './entities/game-session.entity';
import { Game } from '../games/entities/game.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { LeaderboardService } from '../leaderboard/leaderboard.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { User } from '../auth/entities/user.entity';
import { WordsService } from '../dewordle/words/words.service';
import { EnrichedWord } from '../utils/dictionary.helper';

describe('GameSessionsService', () => {
  let service: GameSessionsService;
  let mockSessionRepo: any;
  let mockGameRepo: any;
  let mockEventEmitter: any;
  let mockLeaderboardService: any;
  let mockWordsService: any;

  const mockRandomWord: EnrichedWord = {
    id: 'id',
    word: 'apple',
    isEnriched: false,
  };

  beforeEach(async () => {
    mockSessionRepo = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
    };

    mockGameRepo = {
      findOne: jest.fn(),
    };

    mockEventEmitter = {
      emit: jest.fn(),
    };

    mockLeaderboardService = {
      upsertEntry: jest.fn(),
    };

    mockWordsService = {
      getRandomWord: jest.fn().mockResolvedValue(mockRandomWord),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GameSessionsService,
        {
          provide: getRepositoryToken(GameSession),
          useValue: mockSessionRepo,
        },
        {
          provide: getRepositoryToken(Game),
          useValue: mockGameRepo,
        },
        {
          provide: EventEmitter2,
          useValue: mockEventEmitter,
        },
        {
          provide: LeaderboardService,
          useValue: mockLeaderboardService,
        },
        {
          provide: WordsService,
          useValue: mockWordsService,
        },
      ],
    }).compile();

    service = module.get<GameSessionsService>(GameSessionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const mockGame = { id: 1, name: 'Test Game' };
    const mockUser: Partial<User> = {
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
      password: 'hashedpassword',
      role: 'user',
      walletAddress: '0x742d35Cc6634C0532925a3b8D8Cc6f9b2F3d217',
      sessions: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const createDto: CreateSessionDto = {
      gameId: 1,
      score: 100,
      durationSeconds: 60,
      metadata: { guestId: 'guest123' },
    };

    it('should create a session for authenticated user', async () => {
      mockGameRepo.findOne.mockResolvedValue(mockGame);
      mockSessionRepo.create.mockReturnValue({
        ...createDto,
        game: mockGame,
        user: mockUser,
      });
      mockSessionRepo.save.mockResolvedValue({
        id: 1,
        ...createDto,
        game: mockGame,
        user: mockUser,
      });

      const result = await service.create(createDto, mockUser as User);

      expect(mockGameRepo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(mockSessionRepo.create).toHaveBeenCalledWith({
        ...createDto,
        game: mockGame,
        user: mockUser,
        solution: mockRandomWord.word,
      });
      expect(mockLeaderboardService.upsertEntry).toHaveBeenCalledWith(
        mockUser,
        mockGame,
        100,
        false,
      );
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'session.completed',
        expect.any(Object),
      );
      expect(result).toEqual({
        id: 1,
        ...createDto,
        game: mockGame,
        user: mockUser,
      });
    });

    it('should create a guest session without user', async () => {
      mockGameRepo.findOne.mockResolvedValue(mockGame);
      mockSessionRepo.create.mockReturnValue({ ...createDto, game: mockGame });
      mockSessionRepo.save.mockResolvedValue({
        id: 1,
        ...createDto,
        game: mockGame,
      });

      const result = await service.create(createDto, null);

      expect(mockGameRepo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(mockSessionRepo.create).toHaveBeenCalledWith({
        ...createDto,
        game: mockGame,
        solution: mockRandomWord.word,
      });
      expect(mockLeaderboardService.upsertEntry).not.toHaveBeenCalled();
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'session.completed',
        expect.any(Object),
      );
      expect(result).toEqual({ id: 1, ...createDto, game: mockGame });
    });

    it('should throw NotFoundException when game not found', async () => {
      mockGameRepo.findOne.mockResolvedValue(null);

      await expect(service.create(createDto, mockUser as User)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockGameRepo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should throw BadRequestException for negative score in guest session', async () => {
      const negativeScoreDto = { ...createDto, score: -10 };
      mockGameRepo.findOne.mockResolvedValue(mockGame);

      await expect(service.create(negativeScoreDto, null)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should allow negative score for authenticated users', async () => {
      const negativeScoreDto = { ...createDto, score: -10 };
      mockGameRepo.findOne.mockResolvedValue(mockGame);
      mockSessionRepo.create.mockReturnValue({
        ...negativeScoreDto,
        game: mockGame,
        user: mockUser,
      });
      mockSessionRepo.save.mockResolvedValue({
        id: 1,
        ...negativeScoreDto,
        game: mockGame,
        user: mockUser,
      });

      const result = await service.create(negativeScoreDto, mockUser as User);

      expect(result).toBeDefined();
      expect(mockLeaderboardService.upsertEntry).toHaveBeenCalledWith(
        mockUser,
        mockGame,
        -10,
        false,
      );
    });
  });

  describe('getUserSessions', () => {
    const mockUser: Partial<User> = {
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
      password: 'hashedpassword',
      role: 'user',
      walletAddress: '0x742d35Cc6634C0532925a3b8D8Cc6f9b2F3d217',
      sessions: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should return user sessions for authenticated user', async () => {
      const mockSessions = [{ id: 1, score: 100 }];
      mockSessionRepo.find.mockResolvedValue(mockSessions);

      const result = await service.getUserSessions(mockUser as User);

      expect(mockSessionRepo.find).toHaveBeenCalledWith({
        where: { user: mockUser },
        relations: ['game'],
        order: { playedAt: 'DESC' },
      });
      expect(result).toEqual(mockSessions);
    });

    it('should return guest sessions by guestId', async () => {
      const mockSessions = [{ id: 1, score: 100, user: null }];
      mockSessionRepo.find.mockResolvedValue(mockSessions);

      const result = await service.getUserSessions(null, 'guest123');

      expect(mockSessionRepo.find).toHaveBeenCalledWith({
        where: { user: null, metadata: { guestId: 'guest123' } },
        relations: ['game'],
        order: { playedAt: 'DESC' },
      });
      expect(result).toEqual(mockSessions);
    });

    it('should return empty array for guest without guestId', async () => {
      const result = await service.getUserSessions(null);

      expect(result).toEqual([]);
    });
  });
});
