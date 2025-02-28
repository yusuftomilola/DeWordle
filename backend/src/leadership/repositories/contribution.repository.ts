import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { type Repository, Between } from "typeorm"
import { ContributionEntity } from "../entities/contribution.entity"
import type { PaginationDto } from "../dto/pagination.dto"

@Injectable()
export class ContributionRepository {
  constructor(
    @InjectRepository(ContributionEntity)
    private readonly repository: Repository<ContributionEntity>,
  ) {}

  async save(contribution: ContributionEntity): Promise<ContributionEntity> {
    return this.repository.save(contribution)
  }

  async findOne(id: string): Promise<ContributionEntity> {
    return this.repository.findOne({ where: { id } })
  }

  async findByTypeAndDateRange(contributionTypeId: string, startDate: Date, endDate: Date, pagination: PaginationDto) {
    const [items, totalItems] = await this.repository.findAndCount({
      where: {
        contributionTypeId,
        createdAt: Between(startDate, endDate),
      },
      skip: (pagination.page - 1) * pagination.limit,
      take: pagination.limit,
      order: {
        createdAt: "DESC",
      },
    })

    return { items, totalItems }
  }

  async findUserContributions(userId: string, startDate: Date, endDate: Date, pagination: PaginationDto) {
    const [items, totalItems] = await this.repository.findAndCount({
      where: {
        userId,
        createdAt: Between(startDate, endDate),
      },
      skip: (pagination.page - 1) * pagination.limit,
      take: pagination.limit,
      order: {
        createdAt: "DESC",
      },
    })

    return { items, totalItems }
  }

  async countByDateRange(startDate: Date, endDate: Date): Promise<number> {
    return this.repository.count({
      where: {
        createdAt: Between(startDate, endDate),
      },
    })
  }

  async countByTypeAndDateRange(startDate: Date, endDate: Date): Promise<Record<string, number>> {
    const result = await this.repository
      .createQueryBuilder("contribution")
      .select("contribution.contributionTypeId", "typeId")
      .addSelect("COUNT(*)", "count")
      .where("contribution.createdAt BETWEEN :startDate AND :endDate", { startDate, endDate })
      .groupBy("contribution.contributionTypeId")
      .getRawMany()

    return result.reduce((acc, item) => {
      acc[item.typeId] = Number.parseInt(item.count, 10)
      return acc
    }, {})
  }

  async sumPointsByUserAndDateRange(userId: string, startDate: Date, endDate: Date): Promise<number> {
    const result = await this.repository
      .createQueryBuilder("contribution")
      .select("SUM(contribution.points)", "totalPoints")
      .where("contribution.userId = :userId", { userId })
      .andWhere("contribution.createdAt BETWEEN :startDate AND :endDate", { startDate, endDate })
      .getRawOne()

    return Number.parseInt(result.totalPoints, 10) || 0
  }
}

