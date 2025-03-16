import { Module } from '@nestjs/common';
import { GoogleAuthenticationController } from './google-authtication.controller';
import { GoogleAuthenticationService } from './providers/google-authtication';

@Module({
  controllers: [GoogleAuthenticationController],
  providers: [GoogleAuthenticationService],
})
export class GoogleAuthticationModule {}
