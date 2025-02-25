import { Controller, Get, UseGuards } from '@nestjs/common';
import { GuestGuard } from '../guest/guest.guard';

@Controller('guest-features')
export class GuestFeaturesController {
  @Get()
  @UseGuards(GuestGuard) // This will ensure only valid guests can access this endpoint
  getGuestOnlyData() {
    return {
      message: 'This data is only accessible to valid guests',
    };
  }
}
