import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RetentionMetricsService } from './retention-metrics.service';
import { RetentionMetricsController } from './retention-metrics.controller';
import { RetentionMetric } from './entities/retention-metric.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RetentionMetric, User])],
  controllers: [RetentionMetricsController],
  providers: [RetentionMetricsService],
  exports: [RetentionMetricsService],
})
export class RetentionMetricsModule {}