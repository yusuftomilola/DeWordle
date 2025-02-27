import { Controller, Get, UseGuards } from '@nestjs/common';
import { GuestUserGuard } from '../guest/guest.guard';

@Controller('guest-features')
export class GuestFeaturesController {
  @Get()
  @UseGuards(GuestUserGuard) // This will ensure only valid guests can access this endpoint
  getGuestOnlyData() {
    return {
      message: 'This data is only accessible to valid guests',
    };
  }
}
