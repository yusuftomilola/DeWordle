import { Test, TestingModule } from '@nestjs/testing';
import { PuzzleController } from './puzzle.controller';
import { PuzzleService } from './puzzle.service';

describe('PuzzleController', () => {
  let controller: PuzzleController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PuzzleController],
      providers: [PuzzleService],
    }).compile();

    controller = module.get<PuzzleController>(PuzzleController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

describe('validateWord', () => {
  let puzzleService: PuzzleService;
  let controller: PuzzleController;
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      controllers: [PuzzleController],
      providers: [PuzzleService],
    }).compile();

    puzzleService = module.get<PuzzleService>(PuzzleService);
    controller = module.get<PuzzleController>(PuzzleController);
  });


  it('should call puzzleService.validateWord with correct params and return result', async () => {
    const mockUserId = 'user-123';
    const mockWord = 'testword';
    const mockDto = { word: mockWord };
    const mockReq: any = { user: { id: mockUserId } };
    const mockSession = {
      id: 'session-1',
      userId: mockUserId,
      puzzleId: 'puzzle-1',
      foundWords: [],
      nonThemeWords: [],
      earnedHints: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const mockResponse = {
      word: mockWord,
      type: 'theme',
      valid: true,
      earnedHints: 0,
      updatedSession: mockSession,
    };

    jest.spyOn(puzzleService, 'validateWord').mockResolvedValue(mockResponse);

    const result = await controller.validateWord(mockDto, mockReq);

    expect(puzzleService.validateWord).toHaveBeenCalledWith(mockWord, mockUserId);
    expect(result).toEqual(mockResponse);
  });
});
