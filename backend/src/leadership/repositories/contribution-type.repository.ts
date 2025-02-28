import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import type { Repository } from "typeorm"
import { ContributionTypeEntity } from "../entities/contribution-type.entity"

@Injectable()
export class ContributionTypeRepository {
  constructor(
    @InjectRepository(ContributionTypeEntity)
    private readonly repository: Repository<ContributionTypeEntity>,
  ) {}

  async save(contributionType: ContributionTypeEntity): Promise<ContributionTypeEntity> {
    return this.repository.save(contributionType)
  }

  async findOne(id: string): Promise<ContributionTypeEntity> {
    return this.repository.findOne({ where: { id } })
  }

  async findByName(name: string): Promise<ContributionTypeEntity> {
    return this.repository.findOne({ where: { name } })
  }

  async find(): Promise<ContributionTypeEntity[]> {
    return this.repository.find()
  }

  async createContributionType(
    name: string,
    defaultPoints: number,
    description?: string,
    icon?: string,
  ): Promise<ContributionTypeEntity> {
    const contributionType = new ContributionTypeEntity()
    contributionType.name = name
    contributionType.defaultPoints = defaultPoints
    contributionType.description = description
    contributionType.icon = icon

    return this.repository.save(contributionType)
  }
}

