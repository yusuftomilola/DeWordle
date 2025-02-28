import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { RetentionMetric } from './entities/retention-metric.entity';
import { User } from '../users/entities/user.entity';
import { RetentionQueryDto } from './dto/retention-query.dto';

@Injectable()
export class RetentionMetricsService {
  constructor(
    @InjectRepository(RetentionMetric)
    private retentionMetricRepository: Repository<RetentionMetric>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async calculateDailyMetrics(date: Date) {
    // Start of day: Set hours, minutes, seconds, ms to 0
    const startDate = new Date(date.setHours(0, 0, 0, 0));
    // End of day: Set hours to 23, minutes to 59, etc
    const endDate = new Date(date.setHours(23, 59, 59, 999));
    // Previous day
    const previousDate = new Date(startDate);
    previousDate.setDate(previousDate.getDate() - 1);

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
          new Date(previousDate.setHours(0, 0, 0, 0)),
          new Date(previousDate.setHours(23, 59, 59, 999)),
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
          const weekStart = new Date(cohortDate);
          weekStart.setDate(weekStart.getDate() + (week * 7));
          
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekEnd.getDate() + 7);

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
          cohortDate: cohortDate.toISOString().split('T')[0],
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
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    const threeMonthsAgo = new Date(today);
    threeMonthsAgo.setMonth(today.getMonth() - 3);
    
    const twelveMonthsAgo = new Date(today);
    twelveMonthsAgo.setMonth(today.getMonth() - 12);

    const [dailyMetrics, weeklyMetrics, monthlyMetrics] = await Promise.all([
      this.getMetrics({
        period: 'daily',
        startDate: thirtyDaysAgo.toISOString(),
      }),
      this.getMetrics({
        period: 'weekly',
        startDate: threeMonthsAgo.toISOString(),
      }),
      this.getMetrics({
        period: 'monthly',
        startDate: twelveMonthsAgo.toISOString(),
      }),
    ]);

    return {
      daily: dailyMetrics,
      weekly: weeklyMetrics,
      monthly: monthlyMetrics,
    };
  }
}