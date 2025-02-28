import { Injectable, Logger } from "@nestjs/common"
import type { ContributionRepository } from "../repositories/contribution.repository"
import type { UserContributionRepository } from "../repositories/user-contribution.repository"
import type { GetLeaderboardDto } from "../dto/get-leaderboard.dto"
import type { CreateContributionDto } from "../dto/create-contribution.dto"
import { ContributionTypeEnum } from "../enums/contribution-type.enum"

@Injectable()
export class ContributionMetricsService {
  private readonly logger = new Logger(ContributionMetricsService.name)
  private metrics = {
    leaderboardRequests: 0,
    contributionsCreated: 0,
    contributionsByType: {
      [ContributionTypeEnum.SUBMISSION]: 0,
      [ContributionTypeEnum.EDIT]: 0,
      [ContributionTypeEnum.APPROVAL]: 0,
      [ContributionTypeEnum.COMMENT]: 0,
    },
    totalPoints: 0,
  }

  constructor(
    private readonly contributionRepository: ContributionRepository,
    private readonly userContributionRepository: UserContributionRepository,
  ) {}

  trackLeaderboardRequest(dto: GetLeaderboardDto): void {
    this.metrics.leaderboardRequests++
    this.logger.debug(`Tracked leaderboard request. Total: ${this.metrics.leaderboardRequests}`)
  }

  trackContributionCreated(dto: CreateContributionDto): void {
    this.metrics.contributionsCreated++
    this.metrics.totalPoints += dto.points || 0

    if (dto.type in this.metrics.contributionsByType) {
      this.metrics.contributionsByType[dto.type]++
    }

    this.logger.debug(`Tracked contribution created. Total: ${this.metrics.contributionsCreated}`)
  }

  async getStatistics(startDate: Date, endDate: Date) {
    this.logger.log(`Getting statistics between ${startDate} and ${endDate}`)

    const totalContributions = await this.contributionRepository.countByDateRange(startDate, endDate)
    const contributionsByType = await this.contributionRepository.countByTypeAndDateRange(startDate, endDate)
    const totalUsers = await this.userContributionRepository.countActiveUsersByDateRange(startDate, endDate)
    const topContributors = await this.userContributionRepository.getTopContributors(startDate, endDate, 5)

    return {
      totalContributions,
      contributionsByType,
      totalUsers,
      topContributors,
      averageContributionsPerUser: totalUsers > 0 ? totalContributions / totalUsers : 0,
    }
  }

  async generateDailyMetrics() {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    yesterday.setHours(0, 0, 0, 0)

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    return this.getStatistics(yesterday, today)
  }

  async generateWeeklyMetrics() {
    const lastWeek = new Date()
    lastWeek.setDate(lastWeek.getDate() - 7)
    lastWeek.setHours(0, 0, 0, 0)

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    return this.getStatistics(lastWeek, today)
  }

  async generateMonthlyMetrics() {
    const lastMonth = new Date()
    lastMonth.setMonth(lastMonth.getMonth() - 1)
    lastMonth.setHours(0, 0, 0, 0)

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    return this.getStatistics(lastMonth, today)
  }

  getMetrics() {
    return this.metrics
  }

  resetMetrics() {
    this.metrics = {
      leaderboardRequests: 0,
      contributionsCreated: 0,
      contributionsByType: {
        [ContributionTypeEnum.SUBMISSION]: 0,
        [ContributionTypeEnum.EDIT]: 0,
        [ContributionTypeEnum.APPROVAL]: 0,
        [ContributionTypeEnum.COMMENT]: 0,
      },
      totalPoints: 0,
    }
  }
}

