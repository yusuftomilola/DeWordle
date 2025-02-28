import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { RetentionMetricsService } from './retention-metrics.service';

@Injectable()
export class RetentionMetricsScheduler {
  constructor(private readonly retentionMetricsService: RetentionMetricsService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async calculateDailyMetrics() {
    await this.retentionMetricsService.calculateDailyMetrics(new Date());
  }
}