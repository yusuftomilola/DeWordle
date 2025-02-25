import { Module } from '@nestjs/common';
import { GuestFeaturesService } from './guest-features.service';
import { GuestFeaturesController } from './guest-features.controller';
import { GuestModule } from 'src/guest/guest.module';

@Module({
  imports: [GuestModule],
  controllers: [GuestFeaturesController],
  providers: [GuestFeaturesService],
})
export class GuestFeaturesModule {}
