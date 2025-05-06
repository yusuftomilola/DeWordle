import { Module, MiddlewareConsumer, NestModule, RequestMethod } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { join } from 'path';
import { createClient } from 'redis';
import envConfiguration from 'config/envConfiguration';
import { validate } from '../config/env.validation';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { LeaderboardModule } from './games/dewordle/leaderboard/leaderboard.module';
import { AdminModule } from './admin/admin.module';
import { ResultModule } from './games/dewordle/result/result.module';
import { SubAdminModule } from './sub-admin/sub-admin.module';
import { GuestUserModule } from './guest/guest.module';
import { GuestFeaturesModule } from './guest-features/guest-features.module';
import { MailModule } from './mail/mail.module';
import { PaginationModule } from './common/pagination/pagination-controller.controller';
import { WordsModule } from './games/dewordle/words/words.module';
import { GamesModule } from './games/games.module';
import { DictionaryModule } from './dictionary/dictionary.module';
import { SpellingBeeModule } from './games/spelling-bee/spelling-bee.module';
import { LetteredBoxModule } from './games/lettered-box/lettered-box.module';
import { Leaderboard } from './games/dewordle/leaderboard/entities/leaderboard.entity';
import { Result } from './games/dewordle/result/entities/result.entity';
import { User } from './users/entities/user.entity';
import { SubAdmin } from './sub-admin/entities/sub-admin-entity';
import { Admin } from './admin/entities/admin.entity';
import { GuestUserGuard } from './guest/guest.guard';
import { RedisService } from './guest/provider/redis.service';
import { GuestUserController } from './guest/guest.controller';
import { GuestUserService } from './guest/guest.service';
import { GamesController } from './games/games.controller';
import { SecurityConfig } from '../config/security.config';
import { MetricsModule } from './metrics/metrics.module';
import { logger } from './common/middleware/logger.middleware';
import { SecurityMiddleware } from './common/middleware/security.middleware';
import { DdosProtectionMiddleware } from './common/middleware/ddos-protection.middleware';
import { RequestMonitoringMiddleware } from './common/middleware/request-monitoring.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      envFilePath: [`.env.${process.env.NODE_ENV}`, '.env'], 
      load: [envConfiguration], 
      validate, 
    }),

    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: configService.get<string>('SMTP_HOST'),
          port: configService.get<number>('SMTP_PORT'),
          auth: {
            user: configService.get<string>('SMTP_USER'),
            pass: configService.get<string>('SMTP_PASS'),
          },
        },
        defaults: {
          from: `"No Reply" <${configService.get<string>('SMTP_FROM')}>`,
        },
        template: {
          dir: join(__dirname, '../templates'),
          adapter: new HandlebarsAdapter(),
          options: { strict: true },
        },
      }),
    }),

    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT) || 5432,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      autoLoadEntities: true,
      entities: [User, Result, Leaderboard, Admin, SubAdmin],
      migrations: ['src/migrations/*.ts'],
      synchronize: true,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
      extra: {
        ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
      },
    }),

    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => {
        try {
          const client = createClient({
            url: 'redis://localhost:6379',
          });
          await client.connect();

          return {
            store: 'redis',
            client: client,
            ttl: 300,
          };
        } catch (e) {
          console.warn('Redis connection failed, falling back to memory cache');
          return {
            ttl: 300,
          };
        }
      },
    }),

    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          ttl: config.get('THROTTLE_TTL', 60) * 1000, 
          limit: config.get('THROTTLE_LIMIT', 10), 
        },
      ],
    }),

    MetricsModule,

    UsersModule,
    AuthModule,
    LeaderboardModule,
    AdminModule,
    ResultModule,
    SubAdminModule,
    GuestUserModule,
    GuestFeaturesModule,
    MailModule,
    PaginationModule,
    WordsModule,
    GamesModule,
    DictionaryModule,
    SpellingBeeModule,
    LetteredBoxModule,
  ],
  controllers: [AppController, GuestUserController, GamesController],
  providers: [
    AppService,
    GuestUserGuard,
    RedisService,
    GuestUserService,
 
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    
    SecurityConfig,
    
    DdosProtectionMiddleware,
    SecurityMiddleware,
    RequestMonitoringMiddleware,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(logger).forRoutes('*');

    consumer.apply(SecurityMiddleware).forRoutes('*');

    consumer
      .apply(DdosProtectionMiddleware)
      .exclude({ path: 'metrics', method: RequestMethod.GET })
      .forRoutes('*');

    consumer.apply(RequestMonitoringMiddleware).forRoutes('*');
  }
}