import { Injectable, Logger } from "@nestjs/common"
import type { GetLeaderboardDto } from "../dto/get-leaderboard.dto"
import type { CreateContributionDto } from "../dto/create-contribution.dto"

@Injectable()
export class ContributionLoggerService {
  private readonly logger = new Logger(ContributionLoggerService.name)

  logLeaderboardRequest(dto: GetLeaderboardDto): void {
    this.logger.log(
      `Leaderboard requested with timeRange: ${dto.timeRange}, contributionType: ${dto.contributionType}, page: ${dto.pagination.page}, limit: ${dto.pagination.limit}`,
    )
  }

  logContributionCreated(dto: CreateContributionDto): void {
    this.logger.log(`Contribution created for user: ${dto.userId}, type: ${dto.type}, points: ${dto.points}`)
  }

  logCacheHit(cacheKey: string): void {
    this.logger.debug(`Cache hit for key: ${cacheKey}`)
  }

  logCacheMiss(cacheKey: string): void {
    this.logger.debug(`Cache miss for key: ${cacheKey}`)
  }

  logError(message: string, error: Error): void {
    this.logger.error(`${message}: ${error.message}`, error.stack)
  }

  logAchievementAwarded(userId: string, achievementId: string, achievementName: string): void {
    this.logger.log(`Achievement awarded to user ${userId}: ${achievementName} (${achievementId})`)
  }

  logUserRankChanged(userId: string, oldRank: number, newRank: number): void {
    this.logger.log(`User ${userId} rank changed from ${oldRank} to ${newRank}`)
  }
}

