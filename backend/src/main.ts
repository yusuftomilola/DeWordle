import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import * as compression from 'compression';
import * as cookieParser from 'cookie-parser';
import * as csurf from 'csurf';
import * as session from 'express-session';
import { ConfigService } from '@nestjs/config';
import {
  AllExceptionsFilter,
  ValidationExceptionFilter,
  AuthExceptionFilter,
  SessionExceptionFilter,
  DatabaseExceptionFilter,
  BlockchainExceptionFilter,
} from './common/filters';
import { HttpExceptionFilter } from './common/filters/http-exception.filter'; // New filter
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { logger } from './common/middleware/logger.middleware';
import { CustomValidationPipe } from './common/pipes/validation.pipes';
import { SecurityConfig } from '../config/security.config';

dotenv.config();

async function bootstrap() {
  // Create NestJS application
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  const configService = app.get(ConfigService);
  const securityConfig = app.get(SecurityConfig);

  // Swagger configuration (retained from your original)
  const config = new DocumentBuilder()
    .setTitle('Dewordle API')
    .setDescription('API documentation for Dewordle platform')
    .setVersion('1.0')
    .addBearerAuth() // Enable JWT authentication in Swagger
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Apply security middleware
  app.use(logger); // Custom logging middleware

  // Helmet with custom CSP configuration
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:'],
          connectSrc: ["'self'"],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"],
        },
      },
      xssFilter: true,
      noSniff: true,
      referrerPolicy: { policy: 'same-origin' },
      hsts: {
        maxAge: 15552000, // 180 days
        includeSubDomains: true,
        preload: true,
      },
      frameguard: { action: 'deny' },
    }),
  );

  // Enable response compression
  app.use(compression());

  // Parse cookies
  app.use(cookieParser(configService.get<string>('COOKIE_SECRET')));

  // Session management (for CSRF protection)
  if (process.env.NODE_ENV === 'production') {
    const redisUrl = configService.get<string>('REDIS_URL');
    if (redisUrl) {
      // Connect to Redis for session storage
      const RedisStore = require('connect-redis').default;
      const { createClient } = require('redis');
      const redisClient = createClient({
        url: redisUrl,
        legacyMode: false,
      });
      await redisClient.connect().catch(console.error);

      app.use(
        session({
          store: new RedisStore({ client: redisClient }),
          secret: configService.get<string>('SESSION_SECRET', 'session_secret'),
          resave: false,
          saveUninitialized: false,
          cookie: {
            secure: true,
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24, // 1 day
            sameSite: 'strict',
          },
        }),
      );
    } else {
      console.warn('Redis URL not provided - using memory store for sessions');
      app.use(
        session({
          secret: configService.get<string>('SESSION_SECRET', 'session_secret'),
          resave: false,
          saveUninitialized: false,
          cookie: {
            secure: true,
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24,
            sameSite: 'strict',
          },
        }),
      );
    }
  } else {
    app.use(
      session({
        secret: configService.get<string>('SESSION_SECRET', 'session_secret'),
        resave: false,
        saveUninitialized: false,
        cookie: {
          secure: false, // Allow non-HTTPS in development
          httpOnly: true,
          maxAge: 1000 * 60 * 60 * 24,
        },
      }),
    );
  }

  // CSRF protection for non-GET requests
  if (process.env.NODE_ENV === 'production') {
    app.use(
      csurf({
        cookie: {
          secure: true,
          httpOnly: true,
          sameSite: 'strict',
        },
      }),
    );
  }

  // Enable CORS with dynamic origins
  app.enableCors({
    origin: securityConfig.corsOrigins, // Assumes SecurityConfig provides array of origins
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    maxAge: 3600,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-CSRF-Token', 'X-API-Key'],
    exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset'],
  });

  // Global validation pipe
  app.useGlobalPipes(new CustomValidationPipe()); // Updated to new pipe

  // Global interceptors
  app.useGlobalInterceptors(new LoggingInterceptor());

  // Global filters (combine original and new)
  app.useGlobalFilters(
    new HttpExceptionFilter(), // New filter from updated code
    new ValidationExceptionFilter(),
    new AuthExceptionFilter(),
    new SessionExceptionFilter(),
    new DatabaseExceptionFilter(),
    new BlockchainExceptionFilter(),
    new AllExceptionsFilter(),
  );

  // Set global prefix
  app.setGlobalPrefix('api/v1'); // Retained from original

  // Start the application
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application running on port ${port}`);
}
bootstrap();