import { Injectable, Logger } from "@nestjs/common"
import type { GetLeaderboardDto } from "../dto/get-leaderboard.dto"
import type { CreateContributionDto } from "../dto/create-contribution.dto"
import type { LeaderboardResponseDto } from "../dto/leaderboard-response.dto"
import type { LeaderboardEntryDto } from "../dto/leaderboard-entry.dto"
import { TimeRangeEnum } from "../enums/time-range.enum"
import type { ContributionService } from "./contribution.service"
import type { UserContributionService } from "./user-contribution.service"
import type { ContributionCacheService } from "./contribution-cache.service"
import type { ContributionMetricsService } from "./contribution-metrics.service"
import type { ContributionValidationService } from "./contribution-validation.service"
import type { ContributionAchievementService } from "./contribution-achievement.service"
import type { PaginationDto } from "../dto/pagination.dto"

@Injectable()
export class ContributionLeaderboardService {
  private readonly logger = new Logger(ContributionLeaderboardService.name)

  constructor(
    private readonly contributionService: ContributionService,
    private readonly userContributionService: UserContributionService,
    private readonly cacheService: ContributionCacheService,
    private readonly metricsService: ContributionMetricsService,
    private readonly validationService: ContributionValidationService,
    private readonly achievementService: ContributionAchievementService,
  ) {}

  async getLeaderboard(dto: GetLeaderboardDto): Promise<LeaderboardResponseDto> {
    this.logger.log(`Getting leaderboard with filters: ${JSON.stringify(dto)}`)

    // Try to get from cache first
    const cacheKey = this.cacheService.generateLeaderboardCacheKey(dto)
    const cachedData = await this.cacheService.getLeaderboardFromCache(cacheKey)

    if (cachedData) {
      this.logger.log("Returning leaderboard data from cache")
      return cachedData
    }

    // Calculate date range based on timeRange
    const { startDate, endDate } = this.calculateDateRange(dto.timeRange)

    // Get leaderboard data from repository
    const { items, totalItems } = await this.userContributionService.getLeaderboard(
      startDate,
      endDate,
      dto.contributionType,
      dto.pagination,
    )

    // Transform to DTO
    const leaderboardEntries = items.map((item, index) => {
      const rank = (dto.pagination.page - 1) * dto.pagination.limit + index + 1

      return {
        rank,
        userId: item.userId,
        username: item.username || `User-${item.userId.substring(0, 8)}`,
        avatarUrl: item.avatarUrl || `https://ui-avatars.com/api/?name=${item.username || "User"}&background=random`,
        totalPoints: item.totalPoints,
        contributionCounts: {
          submissions: item.submissionCount || 0,
          edits: item.editCount || 0,
          approvals: item.approvalCount || 0,
          total: (item.submissionCount || 0) + (item.editCount || 0) + (item.approvalCount || 0),
        },
        achievements: item.achievements || [],
        lastContributionDate: item.lastContributionDate,
      } as LeaderboardEntryDto
    })

    const response: LeaderboardResponseDto = {
      timeRange: dto.timeRange,
      contributionType: dto.contributionType,
      pagination: {
        page: dto.pagination.page,
        limit: dto.pagination.limit,
        totalItems,
        totalPages: Math.ceil(totalItems / dto.pagination.limit),
      },
      entries: leaderboardEntries,
    }

    // Store in cache
    await this.cacheService.cacheLeaderboardData(cacheKey, response)

    // Track metrics
    this.metricsService.trackLeaderboardRequest(dto)

    return response
  }

  async recordContribution(dto: CreateContributionDto): Promise<void> {
    this.logger.log(`Recording contribution: ${JSON.stringify(dto)}`)

    // Validate contribution
    await this.validationService.validateContribution(dto)

    // Record the contribution
    const contribution = await this.contributionService.createContribution(dto)

    // Update user contribution aggregates
    await this.userContributionService.updateUserContribution(
      dto.userId,
      dto.type,
      dto.points || this.calculatePoints(dto.type),
    )

    // Check and award achievements
    await this.achievementService.checkAndAwardAchievements(dto.userId)

    // Invalidate cache
    await this.cacheService.invalidateLeaderboardCache()

    // Track metrics
    this.metricsService.trackContributionCreated(dto)

    this.logger.log(`Contribution recorded successfully with ID: ${contribution.id}`)
  }

  async getUserContributions(userId: string, timeRange: TimeRangeEnum, pagination: PaginationDto) {
    this.logger.log(`Getting contributions for user: ${userId}, timeRange: ${timeRange}`)

    const { startDate, endDate } = this.calculateDateRange(timeRange)

    return this.contributionService.getUserContributions(userId, startDate, endDate, pagination)
  }

  async getContributionTypes() {
    return this.contributionService.getContributionTypes()
  }

  async getStatistics(timeRange: TimeRangeEnum) {
    const { startDate, endDate } = this.calculateDateRange(timeRange)

    return this.metricsService.getStatistics(startDate, endDate)
  }

  private calculateDateRange(timeRange: TimeRangeEnum) {
    const now = new Date()
    let startDate: Date
    const endDate = now

    switch (timeRange) {
      case TimeRangeEnum.WEEKLY:
        startDate = new Date(now)
        startDate.setDate(now.getDate() - 7)
        break
      case TimeRangeEnum.MONTHLY:
        startDate = new Date(now)
        startDate.setMonth(now.getMonth() - 1)
        break
      case TimeRangeEnum.YEARLY:
        startDate = new Date(now)
        startDate.setFullYear(now.getFullYear() - 1)
        break
      case TimeRangeEnum.ALL_TIME:
      default:
        startDate = new Date(0) // Beginning of time
        break
    }

    return { startDate, endDate }
  }

  private calculatePoints(contributionType: string): number {
    // Default point values for different contribution types
    const pointValues = {
      submission: 10,
      edit: 5,
      approval: 3,
      comment: 1,
    }

    return pointValues[contributionType.toLowerCase()] || 1
  }
}

