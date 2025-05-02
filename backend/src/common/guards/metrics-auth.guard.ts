import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class MetricsAuthGuard implements CanActivate {
  private readonly logger = new Logger('MetricsAuth');

  constructor(private configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();

    try {
      const authHeader = request.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Basic ')) {
        this.logger.warn('Missing or invalid authorization header', { path: request.url });
        throw new UnauthorizedException('Missing or invalid authorization header');
      }

      const base64Credentials = authHeader.split(' ')[1];
      const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
      const [username, password] = credentials.split(':');

      const expectedUsername = this.configService.get<string>('METRICS_USERNAME');
      const expectedPassword = this.configService.get<string>('METRICS_PASSWORD');

      if (
        !expectedUsername ||
        !expectedPassword ||
        username !== expectedUsername ||
        password !== expectedPassword
      ) {
        this.logger.warn('Invalid credentials for metrics access', { path: request.url });
        throw new UnauthorizedException('Invalid credentials');
      }

      return true;
    } catch (error) {
      this.logger.error('Authentication failed', error.message);
      throw new UnauthorizedException('Authentication failed');
    }
  }
}