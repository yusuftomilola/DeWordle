import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { ForbiddenExceptionFilter } from './auth/providers/forbidden-exception.filter';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // applying the forbidden exception filter globally
  app.useGlobalFilters(new ForbiddenExceptionFilter());

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
