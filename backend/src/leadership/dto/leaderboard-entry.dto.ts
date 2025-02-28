export class LeaderboardEntryDto {
  rank: number
  userId: string
  username: string
  avatarUrl?: string
  totalPoints: number
  contributionCounts: {
    submissions: number
    edits: number
    approvals: number
    total: number
  }
  achievements?: Array<{
    id: string
    name: string
    icon: string
  }>
  lastContributionDate: Date
}

