import { Module } from '@nestjs/common';
import { GuestService } from './provider/guest.service';
import { GuestController } from './guest.controller';

@Module({
  providers: [GuestService],
  controllers: [GuestController],
})
export class GuestModule {}
