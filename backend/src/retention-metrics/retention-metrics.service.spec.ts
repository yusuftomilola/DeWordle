import { Test, TestingModule } from '@nestjs/testing';
import { RetentionMetricsService } from './retention-metrics.service';

describe('RetentionMetricsService', () => {
  let service: RetentionMetricsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RetentionMetricsService],
    }).compile();

    service = module.get<RetentionMetricsService>(RetentionMetricsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
