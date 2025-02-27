import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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

  async updateGuestSession(guestId: string, won: boolean): Promise<void> {
    const session = await this.redisService.getGuestSession(guestId);

    if (!session) {
      throw new NotFoundException('Guest session not found or expired');
    }

    try {
      await this.redisService.updateGameResult(guestId, won);
    } catch (error) {
      throw new BadRequestException('Failed to update game result');
    }
  }

  async getGuestGameResult(guestId: string) {
    const session = await this.redisService.getGuestSession(guestId);

    if (!session) {
      throw new ForbiddenException('Session has expired');
    }

    const result = await this.redisService.getGameResult(guestId);
    if (!result) {
      throw new NotFoundException('No game result found for this guest');
    }
    return result;
  }

  async deleteGuestUserSession(guestId: string): Promise<void> {
    await this.redisService.deleteGuestSession(guestId);
    await this.redisService.deleteGameResult(guestId);
  }
}
