import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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
