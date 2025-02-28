import { Injectable, Logger } from "@nestjs/common"
import { OnEvent } from "@nestjs/event-emitter"
import type { CreateContributionDto } from "../dto/create-contribution.dto"
import type { ContributionCacheService } from "../services/contribution-cache.service"
import type { ContributionLoggerService } from "../services/contribution-logger.service"

@Injectable()
export class ContributionEventListener {
  private readonly logger = new Logger(ContributionEventListener.name)

  constructor(
    private readonly cacheService: ContributionCacheService,
    private readonly loggerService: ContributionLoggerService,
  ) {}

  @OnEvent("contribution.created")
  handleContributionCreatedEvent(payload: CreateContributionDto): void {
    this.logger.log(`Handling contribution.created event for user: ${payload.userId}`)

    // Invalidate cache when a new contribution is created
    this.cacheService.invalidateLeaderboardCache()
  }

  @OnEvent("achievement.awarded")
  handleAchievementAwardedEvent(payload: { userId: string; achievement: any }): void {
    this.logger.log(
      `Handling achievement.awarded event for user: ${payload.userId}, achievement: ${payload.achievement.name}`,
    )

    // Log achievement
    this.loggerService.logAchievementAwarded(payload.userId, payload.achievement.id, payload.achievement.name)
  }

  @OnEvent("leaderboard.updated")
  handleLeaderboardUpdatedEvent(): void {
    this.logger.log("Handling leaderboard.updated event")

    // Invalidate cache when leaderboard is updated
    this.cacheService.invalidateLeaderboardCache()
  }

  @OnEvent("user.rank.changed")
  handleUserRankChangedEvent(payload: { userId: string; oldRank: number; newRank: number }): void {
    this.logger.log(
      `Handling user.rank.changed event for user: ${payload.userId}, oldRank: ${payload.oldRank}, newRank: ${payload.newRank}`,
    )

    // Log rank change
    this.loggerService.logUserRankChanged(payload.userId, payload.oldRank, payload.newRank)
  }
}

