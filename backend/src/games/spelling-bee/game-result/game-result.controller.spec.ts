import { Test, TestingModule } from '@nestjs/testing';
import { GameResultController } from './game-result.controller';
import { GameResultService } from './game-result.service';

describe('GameResultController', () => {
  let controller: GameResultController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GameResultController],
      providers: [GameResultService],
    }).compile();

    controller = module.get<GameResultController>(GameResultController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
