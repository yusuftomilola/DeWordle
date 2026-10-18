/**
 * Pure game-statistics calculations (win rate, streaks, guess distribution),
 * kept free of React and storage so they can be tested deterministically.
 */

export const MAX_GUESSES = 6;

/** One finished game. `day` is a UTC calendar day, `YYYY-MM-DD`. */
export interface GameRecord {
  day: string;
  won: boolean;
  /** Guesses used; 1..MAX_GUESSES. Ignored for losses in the distribution. */
  guesses: number;
}

export interface GuessDistribution {
  /** Wins by guess count; index 0 is "solved in 1", index 5 is "solved in 6". */
  buckets: number[];
  /** Count of the most common bucket, used to scale bars (0 when no wins). */
  max: number;
}

export interface GameStatistics {
  played: number;
  wins: number;
  losses: number;
  /** Whole-number percentage, 0 when nothing has been played. */
  winRate: number;
  currentStreak: number;
  maxStreak: number;
  distribution: GuessDistribution;
}

const DAY_MS = 86_400_000;

function dayNumber(day: string): number {
  return Math.floor(Date.parse(`${day}T00:00:00Z`) / DAY_MS);
}

/** Percentage of games won, rounded to the nearest whole number. */
export function calculateWinRate(wins: number, played: number): number {
  if (played <= 0) return 0;
  return Math.round((wins / played) * 100);
}

/**
 * Streaks count consecutive calendar days with a win. A missed day or a loss
 * ends the streak. When several games share a day, a win on that day counts.
 *
 * `today` decides whether the current streak is still alive: it survives if
 * the latest winning day is today or yesterday, otherwise it has lapsed to 0.
 */
export function calculateStreaks(
  records: GameRecord[],
  today: string,
): { current: number; max: number } {
  const winDays = [
    ...new Set(records.filter((r) => r.won).map((r) => dayNumber(r.day))),
  ].sort((a, b) => a - b);

  let max = 0;
  let run = 0;
  let previous: number | null = null;
  for (const d of winDays) {
    run = previous !== null && d === previous + 1 ? run + 1 : 1;
    max = Math.max(max, run);
    previous = d;
  }

  // Only a run that ends today or yesterday is still "current".
  const latest = winDays.at(-1);
  const current =
    latest !== undefined && dayNumber(today) - latest <= 1 ? run : 0;
  return { current, max };
}

/** Histogram of how many guesses each win took. Losses are not counted. */
export function buildGuessDistribution(
  records: GameRecord[],
): GuessDistribution {
  const buckets = Array.from({ length: MAX_GUESSES }, () => 0);
  for (const r of records) {
    if (!r.won) continue;
    const index = Math.min(Math.max(Math.trunc(r.guesses), 1), MAX_GUESSES) - 1;
    buckets[index] += 1;
  }
  return { buckets, max: Math.max(0, ...buckets) };
}

export function calculateGameStatistics(
  records: GameRecord[],
  today: string,
): GameStatistics {
  const played = records.length;
  const wins = records.filter((r) => r.won).length;
  const { current, max } = calculateStreaks(records, today);
  return {
    played,
    wins,
    losses: played - wins,
    winRate: calculateWinRate(wins, played),
    currentStreak: current,
    maxStreak: max,
    distribution: buildGuessDistribution(records),
  };
}
