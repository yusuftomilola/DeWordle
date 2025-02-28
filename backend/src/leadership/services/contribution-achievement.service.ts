import { Injectable, Logger } from "@nestjs/common"
import type { AchievementRepository } from "../repositories/achievement.repository"
import type { UserAchievementRepository } from "../repositories/user-achievement.repository"
import type { UserContributionRepository } from "../repositories/user-contribution.repository"
import type { AchievementEntity } from "../entities/achievement.entity"
import { UserAchievementEntity } from "../entities/user-achievement.entity"
import type { ContributionEventEmitter } from "../events/contribution-event.emitter"
import type { ContributionLoggerService } from "./contribution-logger.service"

@Injectable()
export class ContributionAchievementService {
  private readonly logger = new Logger(ContributionAchievementService.name)

  constructor(
    private readonly achievementRepository: AchievementRepository,
    private readonly userAchievementRepository: UserAchievementRepository,
    private readonly userContributionRepository: UserContributionRepository,
    private readonly eventEmitter: ContributionEventEmitter,
    private readonly loggerService: ContributionLoggerService,
  ) {
    this.initializeAchievements()
  }

  private async initializeAchievements() {
    // Create default achievements if they don't exist
    const defaultAchievements = [
      {
        id: "first-contribution",
        name: "First Contribution",
        description: "Made your first contribution",
        icon: "🌱",
        threshold: 1,
        type: "total",
      },
      {
        id: "active-contributor",
        name: "Active Contributor",
        description: "Made 10 contributions",
        icon: "🔥",
        threshold: 10,
        type: "total",
      },
      {
        id: "submission-master",
        name: "Submission Master",
        description: "Made 20 submissions",
        icon: "📝",
        threshold: 20,
        type: "submission",
      },
      {
        id: "editor-extraordinaire",
        name: "Editor Extraordinaire",
        description: "Made 15 edits",
        icon: "✏️",
        threshold: 15,
        type: "edit",
      },
      {
        id: "approval-authority",
        name: "Approval Authority",
        description: "Approved 10 contributions",
        icon: "👍",
        threshold: 10,
        type: "approval",
      },
      {
        id: "top-contributor",
        name: "Top Contributor",
        description: "Reached the top 10 on the leaderboard",
        icon: "🏆",
        threshold: 10,
        type: "rank",
      },
    ]

    for (const achievement of defaultAchievements) {
      const existingAchievement = await this.achievementRepository.findById(achievement.id)

      if (!existingAchievement) {
        await this.achievementRepository.save({
          id: achievement.id,
          name: achievement.name,
          description: achievement.description,
          icon: achievement.icon,
          threshold: achievement.threshold,
          type: achievement.type,
        } as AchievementEntity)

        this.logger.log(`Created achievement: ${achievement.name}`)
      }
    }
  }

  async checkAndAwardAchievements(userId: string): Promise<void> {
    this.logger.log(`Checking achievements for user: ${userId}`)

    // Get user contribution summary
    const userContribution = await this.userContributionRepository.findByUserId(userId)

    if (!userContribution) {
      this.logger.log(`No contributions found for user: ${userId}`)
      return
    }

    // Get all achievements
    const achievements = await this.achievementRepository.find()

    // Get user's existing achievements
    const userAchievements = await this.userAchievementRepository.findByUserId(userId)
    const userAchievementIds = userAchievements.map((ua) => ua.achievementId)

    // Check each achievement
    for (const achievement of achievements) {
      // Skip if user already has this achievement
      if (userAchievementIds.includes(achievement.id)) {
        continue
      }

      let shouldAward = false

      // Check if user meets the threshold for this achievement
      switch (achievement.type) {
        case "total":
          shouldAward = this.getTotalContributions(userContribution) >= achievement.threshold
          break
        case "submission":
          shouldAward = userContribution.submissionCount >= achievement.threshold
          break
        case "edit":
          shouldAward = userContribution.editCount >= achievement.threshold
          break
        case "approval":
          shouldAward = userContribution.approvalCount >= achievement.threshold
          break
        case "rank":
          const userRank = await this.userContributionRepository.getUserRank(userId, "all-time")
          shouldAward = userRank <= achievement.threshold
          break
        default:
          break
      }

      if (shouldAward) {
        await this.awardAchievement(userId, achievement)
      }
    }
  }

  private async awardAchievement(userId: string, achievement: AchievementEntity): Promise<void> {
    this.logger.log(`Awarding achievement ${achievement.name} to user ${userId}`)

    // Create user achievement
    const userAchievement = new UserAchievementEntity()
    userAchievement.userId = userId
    userAchievement.achievementId = achievement.id
    userAchievement.awardedAt = new Date()

    await this.userAchievementRepository.save(userAchievement)

    // Emit event
    this.eventEmitter.emitAchievementAwarded(userId, achievement)

    // Log achievement
    this.loggerService.logAchievementAwarded(userId, achievement.id, achievement.name)
  }

  private getTotalContributions(userContribution): number {
    return (
      userContribution.submissionCount +
      userContribution.editCount +
      userContribution.approvalCount +
      userContribution.commentCount
    )
  }

  async getUserAchievements(userId: string) {
    const userAchievements = await this.userAchievementRepository.findByUserId(userId)

    // Enrich with achievement details
    return Promise.all(
      userAchievements.map(async (ua) => {
        const achievement = await this.achievementRepository.findById(ua.achievementId)
        return {
          ...ua,
          achievement,
        }
      }),
    )
  }
}

