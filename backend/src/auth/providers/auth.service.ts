/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, Inject, forwardRef, UseFilters } from '@nestjs/common';
import { SignInDto } from '../dto/create-auth.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { SignInProvider } from './sign-in.provider';
import { RefreshTokenProvider } from './refresh-token.provider';
import { UsersService } from 'src/users/users.service';
import { AuthExceptionFilter } from 'src/common/filters';

@Injectable()
@UseFilters(AuthExceptionFilter) // ✅ Apply AuthExceptionFilter
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,

    private readonly signInProvider: SignInProvider,
    private readonly refreshTokenProvider: RefreshTokenProvider,
  ) {}

  public async SignIn(signInDto: SignInDto) {
    try {
      return await this.signInProvider.SignIn(signInDto);
    } catch (error) {
      throw new Error('Authentication failed'); // The filter will handle this
    }
  }

  public async refreshToken(refreshTokenDto: RefreshTokenDto) {
    try {
      return await this.refreshTokenProvider.refreshToken(refreshTokenDto);
    } catch (error) {
      throw new Error('Refresh token failed'); // The filter will handle this
    }
  }
}
