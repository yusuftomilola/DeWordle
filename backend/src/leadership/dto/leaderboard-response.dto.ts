import type { TimeRangeEnum } from "../enums/time-range.enum"
import type { ContributionTypeEnum } from "../enums/contribution-type.enum"
import type { LeaderboardEntryDto } from "./leaderboard-entry.dto"

export class LeaderboardResponseDto {
  timeRange: TimeRangeEnum
  contributionType?: ContributionTypeEnum
  pagination: {
    page: number
    limit: number
    totalItems: number
    totalPages: number
  }
  entries: LeaderboardEntryDto[]
}

