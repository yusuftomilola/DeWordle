import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './providers/auth.service';
import { AuthController } from './auth.controller';
import { HashingProvider } from './providers/hashing-provider';
import { BcryptProvider } from './providers/bcrypt-provider';
import { UsersModule } from 'src/users/users.module';
import { SignInProvider } from './providers/sign-in.provider';
import { GenerateTokenProvider } from './providers/generate-token.provider';
import jwtConfig from 'config/jwt.config';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { RefreshTokenProvider } from './providers/refresh-token.provider';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from '../../security/jwt.strategy';
import { SubAdminModule } from 'src/sub-admin/sub-admin.module';
import { GoogleAuthenticationController } from './social/google-authtication.controller';
import { GoogleAuthenticationService } from './social/providers/google-authtication';

@Module({
  imports: [
    forwardRef(() => UsersModule),
    forwardRef(() => SubAdminModule),
    ConfigModule.forFeature(jwtConfig),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'yourSecretKey',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [AuthController, GoogleAuthenticationController],
  providers: [
    AuthService,
    JwtStrategy,
    {
      provide: HashingProvider,
      useClass: BcryptProvider,
    },
    SignInProvider,
    GenerateTokenProvider,
    RefreshTokenProvider,
    GoogleAuthenticationService
  ],
  exports: [
    AuthService,
    HashingProvider,
    PassportModule,
    JwtModule,
    JwtStrategy,
  ],
})
export class AuthModule {}
