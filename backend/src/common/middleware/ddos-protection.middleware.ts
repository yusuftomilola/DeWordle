import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { ConfigService } from '@nestjs/config';
import { createClient } from 'redis';

interface SecurityConfig {
  defaultRateLimit: number;
  defaultRateTtl: number;
}

@Injectable()
export class DdosProtectionMiddleware implements NestMiddleware {
  private limiter: ReturnType<typeof rateLimit>;

  constructor(private configService: ConfigService) {
    const redisUrl = this.configService.get<string>('REDIS_URL');
    const securityConfig = this.configService.get<SecurityConfig>('security') || {
      defaultRateLimit: 100,
      defaultRateTtl: 60,
    };

    if (redisUrl) {
      const redisClient = createClient({ url: redisUrl });
      redisClient.connect().catch((err) => console.error('Redis connection error:', err));

      this.limiter = rateLimit({
        windowMs: securityConfig.defaultRateTtl * 1000,
        max: securityConfig.defaultRateLimit,
        legacyHeaders: false,
        message: 'Too many requests from this IP, please try again later',
        store: new RedisStore({
          sendCommand: (...args: string[]) => redisClient.sendCommand(args),
        }),
      });
    } else {
      this.limiter = rateLimit({
        windowMs: securityConfig.defaultRateTtl * 1000,
        max: securityConfig.defaultRateLimit,
        standardHeaders: true,
        legacyHeaders: false,
        message: 'Too many requests from this IP, please try again later',
      });
    }
  }

  use(req: Request, res: Response, next: NextFunction) {
    this.limiter(req, res, next);
  }
}