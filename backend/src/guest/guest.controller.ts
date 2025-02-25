import { Controller, Post, UnauthorizedException, Param } from '@nestjs/common';
import { GuestService } from './guest.service';

@Controller('guest')
export class GuestController {
  constructor(private readonly guestService: GuestService) {}

  @Post()
  createGuestSession() {
    const guestSession = this.guestService.createGuest();

    return {
      guestId: guestSession.id,
      expiresAt: guestSession.expiresAt,
      message: 'Guest session created successfully',
    };
  }

  @Post('validate/:guestId')
  validateGuestSession(@Param('guestId') guestId: string) {
    const isValid = this.guestService.validateGuest(guestId);

    if (!isValid) {
      throw new UnauthorizedException('Guest session is invalid or expired');
    }

    return {
      valid: true,
      message: 'Guest session is valid',
    };
  }

  @Post('refresh/:guestId')
  refreshGuestSession(@Param('guestId') guestId: string) {
    const refreshedSession = this.guestService.refreshGuestSession(guestId);

    if (!refreshedSession) {
      throw new UnauthorizedException('Guest session cannot be refreshed');
    }

    return {
      guestId: refreshedSession.id,
      expiresAt: refreshedSession.expiresAt,
      message: 'Guest session refreshed successfully',
    };
  }
}
