import { ValidationPipe } from '@nestjs/common';
export class CustomValidationPipe extends ValidationPipe {
  constructor() {
    super({ whitelist: true, transform: true, forbidNonWhitelisted: true });
  }
}