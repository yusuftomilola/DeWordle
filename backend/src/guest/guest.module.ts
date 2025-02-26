import { Module } from '@nestjs/common';
import { GuestUserService } from './provider/guest.service';
import { GuestUserController } from './guest.controller';
import { CacheModule } from '@nestjs/cache-manager';
import { GuestGuard } from './guest.guard';
import { RedisService } from './provider/redis.service';

@Module({
  imports: [
    CacheModule.register(), // Enable cache
  ],
  providers: [GuestUserService, GuestGuard, RedisService],
  controllers: [GuestUserController],
})
export class GuestModule {}
