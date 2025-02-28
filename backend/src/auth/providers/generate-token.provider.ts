/* eslint-disable @typescript-eslint/no-unused-vars */
import { Inject, Injectable, UseFilters } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigType } from '@nestjs/config';
import jwtConfig from 'config/jwt.config';
import { User } from 'src/users/entities/user.entity';
import { AuthExceptionFilter } from 'src/common/filters';

@Injectable()
@UseFilters(AuthExceptionFilter) // ✅ Apply AuthExceptionFilter
export class GenerateTokenProvider {
  constructor(
    private readonly jwtService: JwtService,

    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
  ) {}

  public async SignToken<T>(userId: number, expiresIn: number, payload?: T) {
    try {
      return await this.jwtService.signAsync(
        {
          sub: userId,
          ...payload,
        },
        {
          secret: this.jwtConfiguration.secret,
          audience: this.jwtConfiguration.audience,
          issuer: this.jwtConfiguration.issuer,
          expiresIn,
        },
      );
    } catch (error) {
      throw new Error('Token generation failed'); // Let the filter handle it
    }
  }

  public async generateTokens(user: User) {
    try {
      const [access_token, refresh_token] = await Promise.all([
        this.SignToken(user.id, this.jwtConfiguration.expiresIn, {
          email: user.email,
        }),
        this.SignToken(user.id, this.jwtConfiguration.refreshExpiresIn),
      ]);

      return { access_token, refresh_token };
    } catch (error) {
      throw new Error('Error generating tokens'); // Filter will catch this
    }
  }
}
