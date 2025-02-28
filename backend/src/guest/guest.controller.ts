import {
  Controller,
  Post,
  UnauthorizedException,
  Param,
  Delete,
  Patch,
  Body,
  HttpCode,
  HttpStatus,
  Get,
} from '@nestjs/common';
import { GuestUserService } from './guest.service';

@Controller('guest-user')
export class GuestUserController {
  constructor(private readonly guestUserService: GuestUserService) {}

  @Post()
  async createGuestUserSession() {
    const guestSession = await this.guestUserService.createGuestUser();

    return {
      guestId: guestSession.id,
      expiresAt: guestSession.expiresAt,
      message: 'Guest session created successfully',
    };
  }

  @Post('validate/:guestId')
  async validateGuestUserSession(@Param('guestId') guestId: string) {
    const isValid = await this.guestUserService.validateGuestUser(guestId);

    if (!isValid) {
      throw new UnauthorizedException('Guest session is invalid or expired');
    }

    return {
      valid: true,
      message: 'Guest session is valid',
    };
  }

  @Post('refresh/:guestId')
  async refreshGuestUserSession(@Param('guestId') guestId: string) {
    const refreshedSession =
      await this.guestUserService.refreshGuestUserSession(guestId);

    if (!refreshedSession) {
      throw new UnauthorizedException('Guest session cannot be refreshed');
    }

    return {
      guestId: refreshedSession.id,
      expiresAt: refreshedSession.expiresAt,
      message: 'Guest session refreshed successfully',
    };
  }

  @Patch('/:guestId')
  @HttpCode(HttpStatus.OK)
  async updateGuest(
    @Param('guestId') guestId: string,
    @Body('won') won: boolean,
  ) {
    await this.guestUserService.updateGuestSession(guestId, won);
    return { message: 'Game result updated successfully' };
  }

  @Get('/:guestId/result')
  async getGuestResult(@Param('guestId') guestId: string) {
    const result = await this.guestUserService.getGuestGameResult(guestId);
    return result;
  }

  @Delete(':guestId')
  async deleteGuestUserSession(@Param('guestId') guestId: string) {
    await this.guestUserService.deleteGuestUserSession(guestId);

    return {
      message: 'Guest session deleted successfully',
    };
  }
}
