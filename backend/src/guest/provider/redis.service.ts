import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
// import type { Cache } from 'cache-manager';

export interface GameResult {
  timesPlayed: number;
  currentStreak: number;
  maxStreak: number;
  winPercentage: number;
}

export interface GameResult {
  timesPlayed: number;
  currentStreak: number;
  maxStreak: number;
  winPercentage: number;
}

@Injectable()
export class RedisService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: any) {}

  // ✅ Store guest session with 10-min expiry
  async setGuestSession(guestId: string) {
    await this.cacheManager.set(`guest_session:${guestId}`, 'active', {
      ttl: 600,
    }); // TTL: 10 mins
  }

  // ✅ Retrieve guest session and RENEW TTL on each request
  async getGuestSession(guestId: string): Promise<string | null> {
    const session = (await this.cacheManager.get(
      `guest_session:${guestId}`,
    )) as string | null;

    if (session) {
      // 🔄 Session exists → Renew TTL
      await this.cacheManager.set(`guest_session:${guestId}`, 'active', 600);
    }

    return session;
  }

  // ✅ Delete guest session (cleanup after expiry)
  async deleteGuestSession(guestId: string) {
    await this.cacheManager.del(`guest_session:${guestId}`);
  }

  // 🆕 Store temporary game result for guest session
  async setGameResult(guestId: string, result: GameResult) {
    await this.cacheManager.set(`game_result:${guestId}`, result, 600); // TTL: 10 mins
  }

  // 🆕 Get temporary game result
  async getGameResult(guestId: string): Promise<GameResult | null> {
    return (await this.cacheManager.get(
      `game_result:${guestId}`,
    )) as GameResult | null;
  }

  // 🆕 Update game result (increment timesPlayed, update streaks & winPercentage)
  async updateGameResult(guestId: string, won: boolean) {
    let result = await this.getGameResult(guestId);

    if (!result) {
      // Initialize result if it doesn't exist
      result = {
        timesPlayed: 0,
        currentStreak: 0,
        maxStreak: 0,
        winPercentage: 0,
      };
    }

    // Update result based on win/loss
    result.timesPlayed++;
    if (won) {
      result.currentStreak++;
      if (result.currentStreak > result.maxStreak) {
        result.maxStreak = result.currentStreak;
      }
    } else {
      result.currentStreak = 0;
    }

    // Recalculate win percentage
    const totalWins =
      (result.winPercentage * (result.timesPlayed - 1)) / 100 + (won ? 1 : 0);
    result.winPercentage = ((totalWins / result.timesPlayed) * 100).toFixed(
      2,
    ) as unknown as number;

    // Save updated result
    await this.setGameResult(guestId, result);
  }

  // 🆕 Delete game result when session expires
  async deleteGameResult(guestId: string) {
    await this.cacheManager.del(`game_result:${guestId}`);
  }
}
