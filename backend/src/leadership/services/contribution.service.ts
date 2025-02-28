import { Injectable, Logger, NotFoundException } from "@nestjs/common"
import type { ContributionRepository } from "../repositories/contribution.repository"
import type { ContributionTypeRepository } from "../repositories/contribution-type.repository"
import type { CreateContributionDto } from "../dto/create-contribution.dto"
import { ContributionEntity } from "../entities/contribution.entity"
import type { PaginationDto } from "../dto/pagination.dto"
import { ContributionTypeEnum } from "../enums/contribution-type.enum"

@Injectable()
export class ContributionService {
  private readonly logger = new Logger(ContributionService.name)

  constructor(
    private readonly contributionRepository: ContributionRepository,
    private readonly contributionTypeRepository: ContributionTypeRepository,
  ) {}

  async createContribution(dto: CreateContributionDto): Promise<ContributionEntity> {
    this.logger.log(`Creating contribution for user: ${dto.userId}, type: ${dto.type}`)

    // Get or create contribution type
    const contributionType = await this.getOrCreateContributionType(dto.type)

    // Create contribution entity
    const contribution = new ContributionEntity()
    contribution.userId = dto.userId
    contribution.contributionTypeId = contributionType.id
    contribution.points = dto.points || this.getDefaultPointsForType(dto.type)
    contribution.metadata = dto.metadata || {}
    contribution.createdAt = new Date()

    // Save contribution
    return this.contributionRepository.save(contribution)
  }

  async getUserContributions(userId: string, startDate: Date, endDate: Date, pagination: PaginationDto) {
    this.logger.log(`Getting contributions for user: ${userId} between ${startDate} and ${endDate}`)

    const { items, totalItems } = await this.contributionRepository.findUserContributions(
      userId,
      startDate,
      endDate,
      pagination,
    )

    // Enrich with contribution type details
    const enrichedItems = await Promise.all(
      items.map(async (item) => {
        const contributionType = await this.contributionTypeRepository.findOne(item.contributionTypeId)
        return {
          ...item,
          contributionType: contributionType ? contributionType.name : "Unknown",
        }
      }),
    )

    return {
      items: enrichedItems,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        totalItems,
        totalPages: Math.ceil(totalItems / pagination.limit),
      },
    }
  }

  async getContributionTypes() {
    return this.contributionTypeRepository.find()
  }

  async getContributionsByType(type: ContributionTypeEnum, startDate: Date, endDate: Date, pagination: PaginationDto) {
    const contributionType = await this.contributionTypeRepository.findByName(type)

    if (!contributionType) {
      throw new NotFoundException(`Contribution type ${type} not found`)
    }

    return this.contributionRepository.findByTypeAndDateRange(contributionType.id, startDate, endDate, pagination)
  }

  private async getOrCreateContributionType(typeName: string) {
    let contributionType = await this.contributionTypeRepository.findByName(typeName)

    if (!contributionType) {
      this.logger.log(`Creating new contribution type: ${typeName}`)
      contributionType = await this.contributionTypeRepository.createContributionType(
        typeName,
        this.getDefaultPointsForType(typeName),
      )
    }

    return contributionType
  }

  private getDefaultPointsForType(type: string): number {
    const pointsMap = {
      [ContributionTypeEnum.SUBMISSION]: 10,
      [ContributionTypeEnum.EDIT]: 5,
      [ContributionTypeEnum.APPROVAL]: 3,
      [ContributionTypeEnum.COMMENT]: 1,
    }

    return pointsMap[type] || 1
  }
}

