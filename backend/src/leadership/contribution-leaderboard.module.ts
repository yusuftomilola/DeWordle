import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { ContributionLeaderboardController } from "./controllers/contribution-leaderboard.controller"
import { ContributionLeaderboardService } from "./services/contribution-leaderboard.service"
import { ContributionService } from "./services/contribution.service"
import { UserContributionService } from "./services/user-contribution.service"
import { ContributionEntity } from "./entities/contribution.entity"
import { UserContributionEntity } from "./entities/user-contribution.entity"
import { ContributionTypeEntity } from "./entities/contribution-type.entity"
import { ContributionRepository } from "./repositories/contribution.repository"
import { UserContributionRepository } from "./repositories/user-contribution.repository"
import { ContributionTypeRepository } from "./repositories/contribution-type.repository"
import { CacheModule } from "@nestjs/cache-manager"
import { ScheduleModule } from "@nestjs/schedule"
import { ContributionCacheService } from "./services/contribution-cache.service"
import { ContributionSchedulerService } from "./services/contribution-scheduler.service"
import { ContributionEventEmitter } from "./events/contribution-event.emitter"
import { ContributionEventListener } from "./events/contribution-event.listener"
import { ContributionMetricsService } from "./services/contribution-metrics.service"
import { ContributionLoggerService } from "./services/contribution-logger.service"
import { ContributionValidationService } from "./services/contribution-validation.service"
import { ContributionAchievementService } from "./services/contribution-achievement.service"
import { AchievementEntity } from "./entities/achievement.entity"
import { UserAchievementEntity } from "./entities/user-achievement.entity"
import { AchievementRepository } from "./repositories/achievement.repository"
import { UserAchievementRepository } from "./repositories/user-achievement.repository"

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ContributionEntity,
      UserContributionEntity,
      ContributionTypeEntity,
      AchievementEntity,
      UserAchievementEntity,
    ]),
    CacheModule.register({
      ttl: 60 * 60 * 1000, // 1 hour cache
      max: 100, // maximum number of items in cache
    }),
    ScheduleModule.forRoot(),
  ],
  controllers: [ContributionLeaderboardController],
  providers: [
    ContributionLeaderboardService,
    ContributionService,
    UserContributionService,
    ContributionRepository,
    UserContributionRepository,
    ContributionTypeRepository,
    ContributionCacheService,
    ContributionSchedulerService,
    ContributionEventEmitter,
    ContributionEventListener,
    ContributionMetricsService,
    ContributionLoggerService,
    ContributionValidationService,
    ContributionAchievementService,
    AchievementRepository,
    UserAchievementRepository,
  ],
  exports: [ContributionLeaderboardService, ContributionService, UserContributionService],
})
export class ContributionLeaderboardModule {}

