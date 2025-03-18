import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './providers/auth.service';
import { AuthController } from './auth.controller';
import { HashingProvider } from './providers/hashing-provider';
import { BcryptProvider } from './providers/bcrypt-provider';
import { UsersModule } from '../users/users.module';
import { SignInProvider } from './providers/sign-in.provider';
import { GenerateTokenProvider } from './providers/generate-token.provider';
import jwtConfig from 'config/jwt.config';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { RefreshTokenProvider } from './providers/refresh-token.provider';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from '../../security/strategies/jwt.strategy';
import { SubAdminModule } from 'src/sub-admin/sub-admin.module';
import { GoogleAuthenticationController } from './social/google-authtication.controller';
import { GoogleAuthenticationService } from './social/providers/google-authtication';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from 'security/guards/jwt-auth.guard';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { MailModule } from '../mail/mail.module';
import { Token } from './entities/token.entity';
import { TokenService } from './providers/token.services';

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
    TypeOrmModule.forFeature([User, Token]),
    MailModule,
  ],
  controllers: [AuthController, GoogleAuthenticationController],
  providers: [
    AuthService,
    JwtStrategy,
    {
      provide: HashingProvider,
      useClass: BcryptProvider,
    },
    // globalizing auth guards
    // {
    //   provide: APP_GUARD,
    //   useClass: JwtAuthGuard,
    // },
    SignInProvider,
    GenerateTokenProvider,
    RefreshTokenProvider,
    GoogleAuthenticationService,
    TokenService,
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
