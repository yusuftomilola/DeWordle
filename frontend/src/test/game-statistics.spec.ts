import { describe, expect, it } from "vitest";
import {
  buildGuessDistribution,
  calculateGameStatistics,
  calculateStreaks,
  calculateWinRate,
  type GameRecord,
} from "@/lib/game-statistics";

// Deterministic fixtures: fixed dates, no random data.
const win = (day: string, guesses = 4): GameRecord => ({
  day,
  won: true,
  guesses,
});
const loss = (day: string): GameRecord => ({ day, won: false, guesses: 6 });

const TODAY = "2026-03-10";

describe("calculateWinRate", () => {
  it("returns a rounded whole-number percentage", () => {
    expect(calculateWinRate(1, 3)).toBe(33);
    expect(calculateWinRate(2, 3)).toBe(67);
    expect(calculateWinRate(5, 8)).toBe(63);
  });

  it("is 0 when no games were played", () => {
    expect(calculateWinRate(0, 0)).toBe(0);
  });

  it("is 100 for all wins and 0 for all losses", () => {
    expect(calculateWinRate(7, 7)).toBe(100);
    expect(calculateWinRate(0, 7)).toBe(0);
  });
});

describe("calculateStreaks", () => {
  it("counts consecutive winning days ending today", () => {
    const records = [win("2026-03-08"), win("2026-03-09"), win("2026-03-10")];
    expect(calculateStreaks(records, TODAY)).toEqual({ current: 3, max: 3 });
  });

  it("keeps the streak alive when the last win was yesterday", () => {
    const records = [win("2026-03-08"), win("2026-03-09")];
    expect(calculateStreaks(records, TODAY)).toEqual({ current: 2, max: 2 });
  });

  it("resets the current streak after a missed day but remembers the best run", () => {
    const records = [
      win("2026-03-01"),
      win("2026-03-02"),
      win("2026-03-03"),
      // 03-04 .. 03-07 not played
      win("2026-03-08"),
    ];
    expect(calculateStreaks(records, "2026-03-10")).toEqual({
      current: 0,
      max: 3,
    });
    expect(calculateStreaks(records, "2026-03-09")).toEqual({
      current: 1,
      max: 3,
    });
  });

  it("treats a gap of exactly one missed day as a break", () => {
    const records = [win("2026-03-05"), win("2026-03-07"), win("2026-03-08")];
    expect(calculateStreaks(records, "2026-03-08")).toEqual({
      current: 2,
      max: 2,
    });
  });

  it("breaks the streak on a loss", () => {
    const records = [win("2026-03-07"), loss("2026-03-08"), win("2026-03-09")];
    expect(calculateStreaks(records, "2026-03-09")).toEqual({
      current: 1,
      max: 1,
    });
  });

  it("counts a day once even when it has several games", () => {
    const records = [
      win("2026-03-09", 3),
      win("2026-03-09", 5),
      win("2026-03-10"),
    ];
    expect(calculateStreaks(records, TODAY)).toEqual({ current: 2, max: 2 });
  });

  it("does not depend on the order of the records", () => {
    const records = [win("2026-03-10"), win("2026-03-08"), win("2026-03-09")];
    expect(calculateStreaks(records, TODAY)).toEqual({ current: 3, max: 3 });
  });

  it("handles month and year boundaries", () => {
    const records = [win("2025-12-31"), win("2026-01-01"), win("2026-01-02")];
    expect(calculateStreaks(records, "2026-01-02")).toEqual({
      current: 3,
      max: 3,
    });
  });

  it("is 0/0 with no games or only losses", () => {
    expect(calculateStreaks([], TODAY)).toEqual({ current: 0, max: 0 });
    expect(
      calculateStreaks([loss("2026-03-09"), loss("2026-03-10")], TODAY),
    ).toEqual({
      current: 0,
      max: 0,
    });
  });
});

describe("buildGuessDistribution", () => {
  it("builds a histogram of wins by guess count", () => {
    const records = [
      win("2026-03-01", 1),
      win("2026-03-02", 3),
      win("2026-03-03", 3),
      win("2026-03-04", 6),
    ];
    expect(buildGuessDistribution(records)).toEqual({
      buckets: [1, 0, 2, 0, 0, 1],
      max: 2,
    });
  });

  it("does not count losses", () => {
    expect(
      buildGuessDistribution([loss("2026-03-01"), loss("2026-03-02")]),
    ).toEqual({
      buckets: [0, 0, 0, 0, 0, 0],
      max: 0,
    });
  });

  it("is an empty histogram with zero games", () => {
    expect(buildGuessDistribution([])).toEqual({
      buckets: [0, 0, 0, 0, 0, 0],
      max: 0,
    });
  });

  it("clamps out-of-range guess counts into the first and last bucket", () => {
    const records = [win("2026-03-01", 0), win("2026-03-02", 9)];
    expect(buildGuessDistribution(records).buckets).toEqual([1, 0, 0, 0, 0, 1]);
  });
});

describe("calculateGameStatistics", () => {
  it("summarises a mixed history", () => {
    const records = [
      win("2026-03-07", 4),
      loss("2026-03-08"),
      win("2026-03-09", 2),
      win("2026-03-10", 5),
    ];
    expect(calculateGameStatistics(records, TODAY)).toEqual({
      played: 4,
      wins: 3,
      losses: 1,
      winRate: 75,
      currentStreak: 2,
      maxStreak: 2,
      distribution: { buckets: [0, 1, 0, 1, 1, 0], max: 1 },
    });
  });

  it("handles zero games", () => {
    expect(calculateGameStatistics([], TODAY)).toEqual({
      played: 0,
      wins: 0,
      losses: 0,
      winRate: 0,
      currentStreak: 0,
      maxStreak: 0,
      distribution: { buckets: [0, 0, 0, 0, 0, 0], max: 0 },
    });
  });

  it("handles all wins", () => {
    const records = ["2026-03-08", "2026-03-09", "2026-03-10"].map((d) =>
      win(d, 3),
    );
    const stats = calculateGameStatistics(records, TODAY);
    expect(stats).toMatchObject({
      winRate: 100,
      losses: 0,
      currentStreak: 3,
      maxStreak: 3,
    });
  });

  it("handles all losses", () => {
    const records = ["2026-03-08", "2026-03-09", "2026-03-10"].map(loss);
    const stats = calculateGameStatistics(records, TODAY);
    expect(stats).toMatchObject({
      winRate: 0,
      wins: 0,
      currentStreak: 0,
      maxStreak: 0,
    });
    expect(stats.distribution.max).toBe(0);
  });
});
