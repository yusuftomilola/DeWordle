import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
// import type { Cache } from 'cache-manager';

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
    await this.cacheManager.set(`guest_session:${guestId}`, 'active', { ttl: 600 }); // TTL: 10 mins
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
}
