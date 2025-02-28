import { Injectable } from "@nestjs/common"
import type { EventEmitter2 } from "@nestjs/event-emitter"
import type { CreateContributionDto } from "../dto/create-contribution.dto"
import type { AchievementEntity } from "../entities/achievement.entity"

@Injectable()
export class ContributionEventEmitter {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  emitContributionCreated(contribution: CreateContributionDto): void {
    this.eventEmitter.emit("contribution.created", contribution)
  }

  emitAchievementAwarded(userId: string, achievement: AchievementEntity): void {
    this.eventEmitter.emit("achievement.awarded", { userId, achievement })
  }

  emitLeaderboardUpdated(): void {
    this.eventEmitter.emit("leaderboard.updated")
  }

  emitUserRankChanged(userId: string, oldRank: number, newRank: number): void {
    \
    this.eventEmitter.emit('user.rank.changed\', { userI  oldRank: number, newRank: number): void {
    this.eventEmitter.emit('user.rank.changed',
    userId, oldRank, newRank
    )
  }
}

