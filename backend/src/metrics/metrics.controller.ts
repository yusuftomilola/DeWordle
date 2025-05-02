import { Controller, Get, UseGuards, Res, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { MetricsService } from './metrics.service';
import { SkipThrottle } from '../common/decorators/throttle.decorator';
import { MetricsAuthGuard } from '../common/guards/metrics-auth.guard';

@Controller('metrics')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get()
  @SkipThrottle()
  @UseGuards(MetricsAuthGuard)
  async getMetrics(@Res() response: Response): Promise<void> {
    try {
      const metrics = await this.metricsService.getMetrics();
      response.set('Content-Type', this.metricsService.getContentType());
      response.send(metrics);
    } catch (error) {
      throw new HttpException('Failed to retrieve metrics', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}