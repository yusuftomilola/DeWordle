import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import type { Repository } from "typeorm"
import { UserAchievementEntity } from "../entities/user-achievement.entity"

@Injectable()
export class UserAchievementRepository {
  constructor(
    @InjectRepository(UserAchievementEntity)
    private readonly repository: Repository<UserAchievementEntity>,
  ) {}

  async save(userAchievement: UserAchievementEntity): Promise<UserAchievementEntity> {
    return this.repository.save(userAchievement)
  }

  async findByUserId(userId: string): Promise<UserAchievementEntity[]> {
    return this.repository.find({ where: { userId } })
  }

  async findByUserIdAndAchievementId(userId: string, achievementId: string): Promise<UserAchievementEntity> {
    return this.repository.findOne({
      where: {
        userId,
        achievementId,
      },
    })
  }
}

