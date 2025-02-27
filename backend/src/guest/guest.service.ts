import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { RedisService } from './provider/redis.service';

interface GuestSession {
  id: string;
  expiresAt: Date;
}

@Injectable()
export class GuestUserService {
  private readonly EXPIRATION_TIME_MS = 10 * 60 * 1000; // 10 minutes in milliseconds

  constructor(private readonly redisService: RedisService) {}

  async createGuestUser(): Promise<GuestSession> {
    const id = uuidv4();
    const expiresAt = new Date(Date.now() + this.EXPIRATION_TIME_MS);

    await this.redisService.setGuestSession(id);

    return { id, expiresAt };
  }

  async validateGuestUser(guestId: string): Promise<boolean> {
    const session = await this.redisService.getGuestSession(guestId);
    return session !== null;
  }

  async refreshGuestUserSession(guestId: string): Promise<GuestSession | null> {
    const isValid = await this.validateGuestUser(guestId);

    if (!isValid) {
      return null;
    }

    const expiresAt = new Date(Date.now() + this.EXPIRATION_TIME_MS);
    return { id: guestId, expiresAt };
  }

  async deleteGuestUserSession(guestId: string): Promise<void> {
    await this.redisService.deleteGuestSession(guestId);
  }
}
