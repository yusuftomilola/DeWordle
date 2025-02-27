import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { RedisService } from './provider/redis.service';

@Injectable()
export class GuestGuard implements CanActivate {
  constructor(private readonly redisService: RedisService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const headers = request.headers;

    // 1️⃣ Allow authenticated users (with JWT)
    if (headers.authorization) {
      return true; 
    }

    // 2️⃣ Check if 'guest-id' exists in request headers
    const guestId = headers['guest-id'];
    if (!guestId) {
      throw new UnauthorizedException('Guest ID is required');
    }

    // 3️⃣ Check if session exists in Redis (valid or expired)
    const session = await this.redisService.getGuestSession(guestId);

    if (!session) {
      throw new ForbiddenException('Guest session expired or invalid');
    }

    return true; // Allow valid guest access
  }
}
