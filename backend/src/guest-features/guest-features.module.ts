import { Module } from '@nestjs/common';
import { GuestFeaturesService } from './guest-features.service';
import { GuestFeaturesController } from './guest-features.controller';
import { GuestUserModule } from 'src/guest/guest.module';

@Module({
  imports: [GuestUserModule],
  controllers: [GuestFeaturesController],
  providers: [GuestFeaturesService],
})
export class GuestFeaturesModule {}
