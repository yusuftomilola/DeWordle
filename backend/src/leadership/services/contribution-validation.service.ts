import { Injectable, Logger, BadRequestException, NotFoundException } from "@nestjs/common"
import type { CreateContributionDto } from "../dto/create-contribution.dto"
import type { ContributionTypeRepository } from "../repositories/contribution-type.repository"
import { ContributionTypeEnum } from "../enums/contribution-type.enum"

@Injectable()
export class ContributionValidationService {
  private readonly logger = new Logger(ContributionValidationService.name)

  constructor(private readonly contributionTypeRepository: ContributionTypeRepository) {}

  async validateContribution(dto: CreateContributionDto): Promise<void> {
    this.logger.log(`Validating contribution: ${JSON.stringify(dto)}`)

    // Check if user ID is provided
    if (!dto.userId) {
      throw new BadRequestException("User ID is required")
    }

    // Check if contribution type is provided
    if (!dto.type) {
      throw new BadRequestException("Contribution type is required")
    }

    // Check if contribution type exists
    const contributionType = await this.contributionTypeRepository.findByName(dto.type)

    if (!contributionType && !this.isValidContributionType(dto.type)) {
      throw new NotFoundException(`Contribution type ${dto.type} is not valid`)
    }

    // Validate points if provided
    if (dto.points !== undefined && dto.points < 0) {
      throw new BadRequestException("Points cannot be negative")
    }

    // Validate metadata if provided
    if (dto.metadata && typeof dto.metadata !== "object") {
      throw new BadRequestException("Metadata must be an object")
    }

    this.logger.log("Contribution validation successful")
  }

  private isValidContributionType(type: string): boolean {
    // Check if the type is one of the predefined types
    const validTypes = Object.values(ContributionTypeEnum)
    return validTypes.includes(type as ContributionTypeEnum)
  }
}

