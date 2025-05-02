import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SecurityConfig {
  private readonly logger = new Logger(SecurityConfig.name);
  public corsOrigins: string[] | boolean;
  public defaultRateLimit: number;
  public defaultRateTtl: number; 
  public loginRateLimit: number;
  public loginRateTtl: number; 
  public jwtExpiresIn: string;

  constructor(private configService: ConfigService) {
    const origins = this.configService.get<string>('ALLOWED_ORIGINS', '*');
    this.corsOrigins = origins === '*' ? true : origins.split(',');
    if (origins === '*' && process.env.NODE_ENV === 'production') {
      this.logger.warn(
        'Using ALLOWED_ORIGINS="*" in production is insecure. Specify allowed origins.',
      );
    }

    this.defaultRateLimit = this.configService.get<number>('DEFAULT_RATE_LIMIT', 100);
    this.defaultRateTtl = this.configService.get<number>('DEFAULT_RATE_TTL', 60); 

    this.loginRateLimit = this.configService.get<number>('LOGIN_RATE_LIMIT', 5);
    this.loginRateTtl = this.configService.get<number>('LOGIN_RATE_TTL', 60); 
    this.jwtExpiresIn = this.configService.get<string>('JWT_EXPIRES_IN', '1h');
  }
}