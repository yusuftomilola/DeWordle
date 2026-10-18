export interface UserWeekRow {
  userId: number;
  winsTotal: number;
  winsBeforeWeek: number;
  playedWeek: number;
  winsWeek: number;
}

export interface DigestStats {
  gamesPlayed: number;
  winRate: number; // 0..100
  streak: number;
  rank: number;
  /** Positive = moved up the leaderboard. */
  rankChange: number;
}

/** 1 + number of players with strictly more wins (ties share a rank). */
export function rankFor(wins: number, allWins: number[]): number {
  return 1 + allWins.filter((w) => w > wins).length;
}

/**
 * Consecutive UTC days with a finished game, counting back from `today`
 * (or from yesterday if the player has not played yet today).
 */
export function computeStreak(playedDays: string[], today: string): number {
  const days = new Set(playedDays);
  const day = (iso: string, offset: number) => {
    const d = new Date(`${iso}T00:00:00Z`);
    d.setUTCDate(d.getUTCDate() + offset);
    return d.toISOString().slice(0, 10);
  };
  let cursor = days.has(today) ? today : day(today, -1);
  let streak = 0;
  while (days.has(cursor)) {
    streak += 1;
    cursor = day(cursor, -1);
  }
  return streak;
}

export function buildDigestStats(
  row: UserWeekRow,
  allRows: UserWeekRow[],
  playedDays: string[],
  today: string,
): DigestStats {
  const rankNow = rankFor(row.winsTotal, allRows.map((r) => r.winsTotal));
  const rankBefore = rankFor(row.winsBeforeWeek, allRows.map((r) => r.winsBeforeWeek));
  return {
    gamesPlayed: row.playedWeek,
    winRate: row.playedWeek > 0 ? Math.round((row.winsWeek / row.playedWeek) * 100) : 0,
    streak: computeStreak(playedDays, today),
    rank: rankNow,
    rankChange: rankBefore - rankNow,
  };
}

export function describeRankChange(change: number): string {
  if (change > 0) return `up ${change}`;
  if (change < 0) return `down ${-change}`;
  return 'no change';
}

/** Monday 00:00 UTC of the week containing `date`, as `YYYY-MM-DD`. */
export function weekStartOf(date: Date): string {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const dow = (d.getUTCDay() + 6) % 7; // Monday = 0
  d.setUTCDate(d.getUTCDate() - dow);
  return d.toISOString().slice(0, 10);
}
