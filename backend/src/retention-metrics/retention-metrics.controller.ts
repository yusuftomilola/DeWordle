import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { RetentionMetricsService } from './retention-metrics.service';
import { RetentionQueryDto } from './dto/retention-query.dto';
import { JwtAuthGuard } from '../security/guards/jwt-auth.guard';
import { RolesGuard } from '../security/guards/rolesGuard/roles.guard';
import { RoleDecorator } from '../security/decorators/roles.decorator';
import { UserRole } from '../common/enums/users-roles.enum';

@Controller('retention-metrics')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RetentionMetricsController {
  constructor(private readonly retentionMetricsService: RetentionMetricsService) {}

  @Get()
  @RoleDecorator(UserRole.Admin)
  async getMetrics(@Query() query: RetentionQueryDto) {
    return this.retentionMetricsService.getMetrics(query);
  }

  @Get('dashboard')
  @RoleDecorator(UserRole.Admin)
  async getDashboardMetrics() {
    return this.retentionMetricsService.getDashboardMetrics();
  }

  @Get('cohort')
  @RoleDecorator(UserRole.Admin)
  async getCohortAnalysis(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.retentionMetricsService.calculateCohortAnalysis(
      new Date(startDate),
      new Date(endDate),
    );
  }
}