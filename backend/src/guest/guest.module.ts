import { Module } from '@nestjs/common';
import { GuestController } from './guest.controller';
import { GuestService } from './guest.service';
import { GuestGuard } from './guest.guard';

@Module({
  controllers: [GuestController],
  providers: [GuestService, GuestGuard],
  exports: [GuestService, GuestGuard],
})
export class GuestModule {}
