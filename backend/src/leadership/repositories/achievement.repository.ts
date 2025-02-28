import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import type { Repository } from "typeorm"
import { AchievementEntity } from "../entities/achievement.entity"

@Injectable()
export class AchievementRepository {
  constructor(
    @InjectRepository(AchievementEntity)
    private readonly repository: Repository<AchievementEntity>,
  ) {}

  async save(achievement: AchievementEntity): Promise<AchievementEntity> {
    return this.repository.save(achievement)
  }

  async findById(id: string): Promise<AchievementEntity> {
    return this.repository.findOne({ where: { id } })
  }

  async find(): Promise<AchievementEntity[]> {
    return this.repository.find()
  }
}

