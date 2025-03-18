import { Body, Controller, Post } from '@nestjs/common';
import { GoogleAuthenticationService } from './providers/google-authtication';
import { GoogleTokenDto } from './dtos/google-token-dto';

@Controller('auth')
export class GoogleAuthenticationController {
  constructor(
    /*
     * inject googleAuthenticationService
     */
    private readonly googleAuthenticationService: GoogleAuthenticationService,
  ) {}

  @Post('google-authentication')
  public authenticate(@Body() googlTokenDto: GoogleTokenDto) {
    return this.googleAuthenticationService.authenticate(googlTokenDto);
  }
}
