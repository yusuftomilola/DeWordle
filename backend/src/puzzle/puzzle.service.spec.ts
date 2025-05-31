import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PuzzleService } from './puzzle.service';
import { CreatePuzzleDto } from './dto/create-puzzle.dto';
import { Puzzle } from './entities/puzzle.entity';

describe('PuzzleService', () => {
  let service: PuzzleService;
  let repository: Repository<Puzzle>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    findAndCount: jest.fn(),
    remove: jest.fn(),
  };

  const mockPuzzle: Puzzle = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    date: new Date('2024-01-15'),
    theme: 'Animals',
    grid: [
      ['T', 'I', 'G', 'E', 'R', 'S', 'H', 'A'],
      ['L', 'I', 'O', 'N', 'M', 'O', 'N', 'K'],
      ['E', 'L', 'E', 'P', 'H', 'A', 'N', 'T'],
      ['P', 'A', 'N', 'D', 'A', 'B', 'E', 'A'],
      ['R', 'H', 'I', 'N', 'O', 'C', 'E', 'R'],
      ['O', 'S', 'Z', 'E', 'B', 'R', 'A', 'S'],
    ],
    validWords: ['TIGER', 'LION', 'ELEPHANT', 'PANDA', 'RHINO', 'ZEBRA'],
    spangram: 'ELEPHANT',
    createdAt: new Date(),
    updatedAt: new Date(),
    validateGridDimensions: jest.fn().mockReturnValue(true),
    validateSpangram: jest.fn().mockReturnValue(true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PuzzleService,
        {
          provide: getRepositoryToken(Puzzle),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<PuzzleService>(PuzzleService);
    repository = module.get<Repository<Puzzle>>(getRepositoryToken(Puzzle));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createPuzzle', () => {
    const createPuzzleDto: CreatePuzzleDto = {
      date: new Date('2024-01-15'),
      theme: 'Animals',
      grid: mockPuzzle.grid,
      validWords: mockPuzzle.validWords,
      spangram: 'ELEPHANT',
    };

    it('should create a puzzle successfully', async () => {
      mockRepository.findOne.mockResolvedValue(null); // No existing puzzle
      mockRepository.create.mockReturnValue(mockPuzzle);
      mockRepository.save.mockResolvedValue(mockPuzzle);

      const result = await service.createPuzzle(createPuzzleDto);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { date: createPuzzleDto.date },
      });
      expect(mockRepository.create).toHaveBeenCalledWith(createPuzzleDto);
      expect(mockRepository.save).toHaveBeenCalledWith(mockPuzzle);
      expect(result).toEqual(mockPuzzle);
    });

    it('should throw ConflictException if puzzle already exists', async () => {
      mockRepository.findOne.mockResolvedValue(mockPuzzle);

      await expect(service.createPuzzle(createPuzzleDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw BadRequestException for invalid grid dimensions', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      const invalidPuzzle = {
        ...mockPuzzle,
        validateGridDimensions: jest.fn().mockReturnValue(false),
      };
      mockRepository.create.mockReturnValue(invalidPuzzle);

      await expect(service.createPuzzle(createPuzzleDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if spangram not in valid words', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      const invalidPuzzle = {
        ...mockPuzzle,
        validateSpangram: jest.fn().mockReturnValue(false),
      };
      mockRepository.create.mockReturnValue(invalidPuzzle);

      await expect(service.createPuzzle(createPuzzleDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getTodaysPuzzle', () => {
    it("should return today's puzzle", async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      mockRepository.findOne.mockResolvedValue(mockPuzzle);

      const result = await service.getTodaysPuzzle();

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { date: today },
      });
      expect(result).toEqual(mockPuzzle);
    });

    it('should return null if no puzzle exists for today', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.getTodaysPuzzle();

      expect(result).toBeNull();
    });
  });

  describe('getPuzzleByDate', () => {
    it('should return puzzle for specific date', async () => {
      const date = new Date('2024-01-15');
      mockRepository.findOne.mockResolvedValue(mockPuzzle);

      const result = await service.getPuzzleByDate(date);

      expect(result).toEqual(mockPuzzle);
    });

    it('should throw NotFoundException if puzzle not found', async () => {
      const date = new Date('2024-01-15');
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.getPuzzleByDate(date)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getPuzzleById', () => {
    it('should return puzzle by ID', async () => {
      mockRepository.findOne.mockResolvedValue(mockPuzzle);

      const result = await service.getPuzzleById('test-id');

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'test-id' },
      });
      expect(result).toEqual(mockPuzzle);
    });

    it('should throw NotFoundException if puzzle not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.getPuzzleById('test-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('validateSolution', () => {
    it('should validate complete solution correctly', async () => {
      mockRepository.findOne.mockResolvedValue(mockPuzzle);
      const foundWords = [
        'TIGER',
        'LION',
        'ELEPHANT',
        'PANDA',
        'RHINO',
        'ZEBRA',
      ];

      const result = await service.validateSolution('test-id', foundWords);

      expect(result.isComplete).toBe(true);
      expect(result.foundSpangram).toBe(true);
      expect(result.validWords).toEqual(foundWords);
      expect(result.invalidWords).toEqual([]);
      expect(result.missingWords).toEqual([]);
    });

    it('should validate incomplete solution correctly', async () => {
      mockRepository.findOne.mockResolvedValue(mockPuzzle);
      const foundWords = ['TIGER', 'LION', 'INVALID'];

      const result = await service.validateSolution('test-id', foundWords);

      expect(result.isComplete).toBe(false);
      expect(result.foundSpangram).toBe(false);
      expect(result.validWords).toEqual(['TIGER', 'LION']);
      expect(result.invalidWords).toEqual(['INVALID']);
      expect(result.missingWords).toContain('ELEPHANT');
    });
  });
});
