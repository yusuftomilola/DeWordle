import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { type Repository, MoreThan } from "typeorm"
import { UserContributionEntity } from "../entities/user-contribution.entity"
import { ContributionTypeEnum } from "../enums/contribution-type.enum"
import type { PaginationDto } from "../dto/pagination.dto"

@Injectable()
export class UserContributionRepository {
  constructor(
    @InjectRepository(UserContributionEntity)
    private readonly repository: Repository<UserContributionEntity>,
  ) {}

  async save(userContribution: UserContributionEntity): Promise<UserContributionEntity> {
    return this.repository.save(userContribution)
  }

  async findByUserId(userId: string): Promise<UserContributionEntity> {
    return this.repository.findOne({ where: { userId } })
  }

  async getLeaderboard(
    startDate: Date,
    endDate: Date,
    contributionType?: ContributionTypeEnum,
    pagination?: PaginationDto,
  ) {
    const queryBuilder = this.repository
      .createQueryBuilder("userContribution")
      .where("userContribution.lastContributionDate BETWEEN :startDate AND :endDate", {
        startDate,
        endDate,
      })

    // Filter by contribution type if provided
    if (contributionType) {
      switch (contributionType) {
        case ContributionTypeEnum.SUBMISSION:
          queryBuilder.andWhere("userContribution.submissionCount > 0")
          queryBuilder.orderBy("userContribution.submissionCount", "DESC")
          break
        case ContributionTypeEnum.EDIT:
          queryBuilder.andWhere("userContribution.editCount > 0")
          queryBuilder.orderBy("userContribution.editCount", "DESC")
          break
        case ContributionTypeEnum.APPROVAL:
          queryBuilder.andWhere("userContribution.approvalCount > 0")
          queryBuilder.orderBy("userContribution.approvalCount", "DESC")
          break
        case ContributionTypeEnum.COMMENT:
          queryBuilder.andWhere("userContribution.commentCount > 0")
          queryBuilder.orderBy("userContribution.commentCount", "DESC")
          break
        default:
          queryBuilder.orderBy("userContribution.totalPoints", "DESC")
          break
      }
    } else {
      queryBuilder.orderBy("userContribution.totalPoints", "DESC")
    }

    // Add secondary sorting
    queryBuilder.addOrderBy("userContribution.lastContributionDate", "DESC")

    // Add pagination
    if (pagination) {
      queryBuilder.skip((pagination.page - 1) * pagination.limit)
      queryBuilder.take(pagination.limit)
    }

    const [items, totalItems] = await queryBuilder.getManyAndCount()

    return { items, totalItems }
  }

  async getUserRank(userId: string, timeRange: string): Promise<number> {
    // This is a simplified implementation
    // In a real-world scenario, you would need to calculate this based on the time range
    const result = await this.repository
      .createQueryBuilder("userContribution")
      .select("COUNT(*)", "rank")
      .where(
        "userContribution.totalPoints > (SELECT totalPoints FROM contribution_leaderboard_user_contributions WHERE userId = :userId)",
        { userId },
      )
      .getRawOne()

    return Number.parseInt(result.rank, 10) + 1 // Add 1 because we're counting users with more points
  }

  async countActiveUsersByDateRange(startDate: Date, endDate: Date): Promise<number> {
    return this.repository.count({
      where: {
        lastContributionDate: MoreThan(startDate),
      },
    })
  }

  async getTopContributors(startDate: Date, endDate: Date, limit: number) {
    return this.repository.find({
      where: {
        lastContributionDate: MoreThan(startDate),
      },
      order: {
        totalPoints: "DESC",
      },
      take: limit,
    })
  }

  async getAllUsersWithContributions(): Promise<UserContributionEntity[]> {
    return this.repository.find({
      where: {
        totalPoints: MoreThan(0),
      },
    })
  }
}

