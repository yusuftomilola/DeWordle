import { Test, TestingModule } from '@nestjs/testing';
import { SpellingBeeController } from './spelling-bee.controller';

describe('SpellingBeeController', () => {
  let controller: SpellingBeeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SpellingBeeController],
    }).compile();

    controller = module.get<SpellingBeeController>(SpellingBeeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
