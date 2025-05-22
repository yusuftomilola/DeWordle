import {
  forwardRef,
  Inject,
  Injectable,
  UnauthorizedException,
  UseFilters,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigType } from '@nestjs/config';
import { GenerateTokenProvider } from './generate-token.provider';
import jwtConfig from 'config/jwt.config';
import { UsersService } from 'src/users/users.service';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { SubAdminService } from 'src/sub-admin/sub-admin.service';
import { AuthExceptionFilter } from 'src/common/filters';

@Injectable()
@UseFilters(AuthExceptionFilter) // ✅ Apply AuthExceptionFilter
export class RefreshTokenProvider {
  constructor(
    @Inject(forwardRef(() => UsersService))
    private readonly userServices: UsersService,
    private readonly jwtService: JwtService,

    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,

    private readonly generateTokensProvider: GenerateTokenProvider,
    private readonly subAdminService: SubAdminService,
  ) {}

  public async refreshToken(refreshTokenDto: RefreshTokenDto) {
    try {
      const { sub } = await this.jwtService.verifyAsync(
        refreshTokenDto.refreshToken,
        {
          secret: this.jwtConfiguration.secret,
          audience: this.jwtConfiguration.audience,
          issuer: this.jwtConfiguration.issuer,
        },
      );

      const user = await this.userServices.findOneById(sub);
      const subAdmin = await this.subAdminService.findOneById(sub);

      const account = user || subAdmin;
      if (!account) {
        throw new UnauthorizedException('User not found');
      }

      const access_token = await this.generateTokensProvider.SignToken(
        account.id,
        this.jwtConfiguration.expiresIn,
        { email: account.email },
      );

      return { access_token, refresh_token: refreshTokenDto.refreshToken };
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Refresh token has expired');
      }

      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }
}
