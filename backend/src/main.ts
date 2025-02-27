import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import {
  AllExceptionsFilter,
  ValidationExceptionFilter,
  AuthExceptionFilter,
  SessionExceptionFilter,
  DatabaseExceptionFilter,
  BlockchainExceptionFilter,
} from './common/filters';
import { ValidationPipe, BadRequestException } from '@nestjs/common';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      exceptionFactory: (errors) => {
        const messages = errors.map((error) => {
          return {
            property: error.property,
            constraints: error.constraints,
          };
        });
        return new BadRequestException({
          message: 'Validation failed',
          errors: messages,
        });
      },
    }),
  );

  app.useGlobalFilters(
    new ValidationExceptionFilter(),
    new AuthExceptionFilter(),
    new SessionExceptionFilter(),
    new DatabaseExceptionFilter(),
    new BlockchainExceptionFilter(),
    new AllExceptionsFilter(),
  );


   // enable cors
   app.enableCors({
    origin: 'http://localhost:3500/', // All locations
    credentials: true, // Allow cookies
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allowed methods
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
