import { Test, TestingModule } from '@nestjs/testing';
import { GuestFeaturesController } from './guest-features.controller';
import { GuestFeaturesService } from './guest-features.service';

describe('GuestFeaturesController', () => {
  let controller: GuestFeaturesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GuestFeaturesController],
      providers: [GuestFeaturesService],
    }).compile();

    controller = module.get<GuestFeaturesController>(GuestFeaturesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
