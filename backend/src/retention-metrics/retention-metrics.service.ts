import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { RetentionMetric } from './entities/retention-metric.entity';
import { User } from '../users/entities/user.entity';
import { RetentionQueryDto } from './dto/retention-query.dto';
import { subDays, subWeeks, subMonths, startOfDay, endOfDay, format } from 'date-fns';

@Injectable()
export class RetentionMetricsService {
  constructor(
    @InjectRepository(RetentionMetric)
    private retentionMetricRepository: Repository<RetentionMetric>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async calculateDailyMetrics(date: Date) {
    const startDate = startOfDay(date);
    const endDate = endOfDay(date);
    const previousDate = subDays(startDate, 1);

    // Get active users for the current day
    const activeUsers = await this.userRepository.count({
      where: {
        lastActivityAt: Between(startDate, endDate),
      },
    });

    // Get total users up to this date
    const totalUsers = await this.userRepository.count({
      where: {
        createdAt: LessThanOrEqual(endDate),
      },
    });

    // Get new users for this day
    const newUsers = await this.userRepository.count({
      where: {
        createdAt: Between(startDate, endDate),
      },
    });

    // Calculate returning users (active - new)
    const returningUsers = activeUsers - newUsers;

    // Calculate churn rate
    const previousDayUsers = await this.userRepository.count({
      where: {
        lastActivityAt: Between(
          startOfDay(previousDate),
          endOfDay(previousDate),
        ),
      },
    });

    const churnRate =
      previousDayUsers > 0
        ? ((previousDayUsers - returningUsers) / previousDayUsers) * 100
        : 0;

    // Calculate retention rate
    const retentionRate = totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0;

    return this.retentionMetricRepository.save({
      date: startDate,
      period: 'daily',
      totalUsers,
      activeUsers,
      retentionRate,
      churnRate,
      newUsers,
      returningUsers,
    });
  }

  async calculateCohortAnalysis(startDate: Date, endDate: Date) {
    const cohorts = await this.userRepository
      .createQueryBuilder('user')
      .select(`DATE_TRUNC('week', user.createdAt)`, 'cohortDate')
      .addSelect('COUNT(DISTINCT user.id)', 'userCount')
      .where('user.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .groupBy('cohortDate')
      .getRawMany();

    // Calculate weekly retention for each cohort
    const cohortData = await Promise.all(
      cohorts.map(async (cohort) => {
        const cohortDate = new Date(cohort.cohortDate);
        const retentionByWeek = [];

        for (let week = 0; week < 12; week++) {
          const weekStart = addWeeks(cohortDate, week);
          const weekEnd = addWeeks(weekStart, 1);

          const activeUsers = await this.userRepository.count({
            where: {
              createdAt: LessThanOrEqual(cohortDate),
              lastActivityAt: Between(weekStart, weekEnd),
            },
          });

          const retentionRate = (activeUsers / parseInt(cohort.userCount)) * 100;
          retentionByWeek.push(Math.round(retentionRate));
        }

        return {
          cohortDate: format(cohortDate, 'yyyy-MM-dd'),
          userCount: parseInt(cohort.userCount),
          retentionByWeek,
        };
      }),
    );

    return cohortData;
  }

  async getMetrics(query: RetentionQueryDto) {
    const { period, startDate, endDate = new Date() } = query;
    
    return this.retentionMetricRepository.find({
      where: {
        period,
        date: Between(new Date(startDate), new Date(endDate)),
      },
      order: {
        date: 'DESC',
      },
    });
  }

  async getDashboardMetrics() {
    const today = new Date();
    const [
      dailyMetrics,
      weeklyMetrics,
      monthlyMetrics,
    ] = await Promise.all([
      this.getMetrics({
        period: 'daily',
        startDate: subDays(today, 30).toISOString(),
      }),
      this.getMetrics({
        period: 'weekly',
        startDate: subMonths(today, 3).toISOString(),
      }),
      this.getMetrics({
        period: 'monthly',
        startDate: subMonths(today, 12).toISOString(),
      }),
    ]);

    return {
      daily: dailyMetrics,
      weekly: weeklyMetrics,
      monthly: monthlyMetrics,
    };
  }
}