import { IsEnum, IsOptional, ValidateNested } from "class-validator"
import { Type } from "class-transformer"
import { TimeRangeEnum } from "../enums/time-range.enum"
import { ContributionTypeEnum } from "../enums/contribution-type.enum"
import { PaginationDto } from "./pagination.dto"

export class GetLeaderboardDto {
  @IsEnum(TimeRangeEnum)
  @IsOptional()
  timeRange: TimeRangeEnum = TimeRangeEnum.ALL_TIME

  @IsEnum(ContributionTypeEnum)
  @IsOptional()
  contributionType?: ContributionTypeEnum

  @ValidateNested()
  @Type(() => PaginationDto)
  pagination: PaginationDto
}

