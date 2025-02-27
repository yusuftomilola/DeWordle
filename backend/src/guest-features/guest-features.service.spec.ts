import { Test, TestingModule } from '@nestjs/testing';
import { GuestFeaturesService } from './guest-features.service';

describe('GuestFeaturesService', () => {
  let service: GuestFeaturesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GuestFeaturesService],
    }).compile();

    service = module.get<GuestFeaturesService>(GuestFeaturesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
