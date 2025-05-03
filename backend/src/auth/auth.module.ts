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
import { ThrottlerModule } from '@nestjs/throttler'; 
import { SecurityConfig } from '../../config/security.config';

@Module({
  imports: [
    forwardRef(() => UsersModule),
    forwardRef(() => SubAdminModule),
    ConfigModule.forFeature(jwtConfig),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET', 'yourSecretKey'),
        signOptions: { expiresIn: configService.get<string>('JWT_EXPIRES_IN', '1h') },
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([User, Token]),
    MailModule,
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule, SecurityConfig],
      inject: [ConfigService, SecurityConfig],
      useFactory: (configService: ConfigService, securityConfig: SecurityConfig) => ({
        ttl: securityConfig.defaultRateTtl * 1000,
        limit: securityConfig.defaultRateLimit,
        ignoreUserAgents: [/googlebot/i],
        throttlers: [], // Add an empty array or configure as needed
      }),
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
    // globalizing auth guards (commented out as in original)
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