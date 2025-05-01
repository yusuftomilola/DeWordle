import { Test, TestingModule } from '@nestjs/testing';
import { GameResultService } from './game-result.service';

describe('GameResultService', () => {
  let service: GameResultService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GameResultService],
    }).compile();

    service = module.get<GameResultService>(GameResultService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
