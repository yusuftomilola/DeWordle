import { Test, TestingModule } from '@nestjs/testing';
import { RetentionMetricsController } from './retention-metrics.controller';
import { RetentionMetricsService } from './retention-metrics.service';

describe('RetentionMetricsController', () => {
  let controller: RetentionMetricsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RetentionMetricsController],
      providers: [RetentionMetricsService],
    }).compile();

    controller = module.get<RetentionMetricsController>(RetentionMetricsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
