import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { GuestUserController } from './guest.controller';
import { GuestUserService } from './guest.service';
import { GuestUserGuard } from './guest.guard';
import { RedisService } from './provider/redis.service';

@Module({
  imports: [
    CacheModule.register(), // Enable cache
  ],
  providers: [GuestUserService, GuestUserGuard, RedisService],
  controllers: [GuestUserController],
  exports: [GuestUserService, GuestUserGuard],
})
export class GuestUserModule {}
