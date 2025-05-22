import {
  Param,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
  Get,
} from '@nestjs/common';
import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './providers/auth.service';
import { SignInDto } from './dto/create-auth.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { EmailDto } from './dto/email.dto';

@ApiTags('Auth') // Group all endpoints under the 'Auth' tag
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign-in')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sign in a user' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User signed in successfully',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid credentials',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  @ApiBody({ type: SignInDto })
  public SignIn(@Body() signinDto: SignInDto) {
    return this.authService.SignIn(signinDto);
  }

  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh an access token' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Access token refreshed successfully',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid or expired refresh token',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  @ApiBody({ type: RefreshTokenDto })
  public async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto);
  }

  @Get('verify-email/:token')
  async verifyEmail(@Param('token') token: string) {
    try {
      return await this.authService.verifyEmail(token);
    } catch (error) {
      throw new BadRequestException(
        error.message || 'Invalid verification token',
      );
    }
  }

  @Post('resend-verification')
  @HttpCode(HttpStatus.OK)
  async resendVerificationEmail(@Body() emailDto: EmailDto) {
    try {
      return await this.authService.resendVerificationEmail(emailDto.email);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(error.message);
    }
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    try {
      return await this.authService.forgotPassword(forgotPasswordDto.email);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(error.message);
    }
  }

  @Post('reset-password/:token')
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @Param('token') token: string,
    @Body() resetPasswordDto: ResetPasswordDto,
  ) {
    try {
      return await this.authService.resetPassword(
        token,
        resetPasswordDto.password,
      );
    } catch (error) {
      throw new BadRequestException(error.message || 'Invalid reset token');
    }
  }
}
