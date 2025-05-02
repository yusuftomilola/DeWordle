import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as rateLimit from 'express-rate-limit';
import * as RedisStore from 'rate-limit-redis';
import { ConfigService } from '@nestjs/config';
import { SecurityConfig } from '../../config/security.config';
import { createClient } from 'redis';

@Injectable()
export class DdosProtectionMiddleware implements NestMiddleware {
  private limiter: any;

  constructor(private configService: ConfigService, private securityConfig: SecurityConfig) {
    const redisUrl = this.configService.get<string>('REDIS_URL');

    if (redisUrl) {
      const redisClient = createClient({ url: redisUrl });
      redisClient.connect().catch((err) => console.error('Redis connection error:', err));

      this.limiter = rateLimit({
        windowMs: this.securityConfig.defaultRateTtl * 1000, 
        legacyHeaders: false,
        message: 'Too many requests from this IP, please try again later',
        store: new RedisStore({
          sendCommand: (...args: string[]) => redisClient.sendCommand(args),
        }),
      });
    } else {
      this.limiter = rateLimit({
        windowMs: this.securityConfig.defaultRateTtl * 1000,
        max: this.securityConfig.defaultRateLimit,
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