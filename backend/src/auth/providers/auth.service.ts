import {
  Injectable,
  Inject,
  forwardRef,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
  UseFilters,
} from '@nestjs/common';
import { SignInDto } from '../dto/create-auth.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { RegisterDto } from '../dto/register.dto';
import { SignInProvider } from './sign-in.provider';
import { RefreshTokenProvider } from './refresh-token.provider';
import { UsersService } from 'src/users/users.service';
import { AuthExceptionFilter } from 'src/common/filters';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomBytes } from 'crypto';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { User } from 'src/users/entities/user.entity';
import { Token } from 'src/auth/entities/token.entity';
import { TokenType } from 'src/auth/enums/token-type.enum';
import { MailService } from 'src/mail/providers/mail.service';

const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

@Injectable()
@UseFilters(AuthExceptionFilter)
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly signInProvider: SignInProvider,
    private readonly refreshTokenProvider: RefreshTokenProvider,

    @InjectRepository(User)
    private usersRepository: Repository<User>,

    @InjectRepository(Token)
    private tokensRepository: Repository<Token>,
    private configService: ConfigService,
    private mailService: MailService,
  ) {}

  /**
   * Register a new user.
   */
  public async register(registerDto: RegisterDto): Promise<{ message: string }> {
    const { email, password, username } = registerDto;

    // Check if the user already exists
    const existingUser = await this.usersRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    // Validate password strength
    this.validatePassword(password);

    // Hash the password
    const hashedPassword = await this.hashPassword(password);

    // Create a new user
    const newUser = this.usersRepository.create({
      email,
      password: hashedPassword,
      userName: username,
      isVerified: false,
    });

    await this.usersRepository.save(newUser);

    // Send a verification email
    const verificationToken = await this.createToken(
      newUser.id,
      TokenType.VERIFICATION,
    );
    await this.mailService.sendVerificationEmail(
      newUser.email,
      verificationToken.token,
    );

    return { message: 'User registered successfully. Please verify your email.' };
  }

  /**
   * Sign in a user.
   */
  public async SignIn(signInDto: SignInDto) {
    return await this.signInProvider.SignIn(signInDto);
  }

  /**
   * Refresh an access token.
   */
  public async refreshToken(refreshTokenDto: RefreshTokenDto) {
    return await this.refreshTokenProvider.refreshToken(refreshTokenDto);
  }

  /**
   * Verify a user's email using a token.
   */
  async verifyEmail(token: string) {
    const verificationToken = await this.tokensRepository.findOne({
      where: { token, type: TokenType.VERIFICATION },
      relations: ['user'],
    });

    if (!verificationToken) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    const user = verificationToken.user;
    user.isVerified = true;
    await this.usersRepository.save(user);

    await this.tokensRepository.remove(verificationToken);

    return { message: 'Email verified successfully' };
  }

  /**
   * Resend a verification email to the user.
   */
  async resendVerificationEmail(email: string) {
    const user = await this.usersRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.isVerified) {
      throw new BadRequestException('Email already verified');
    }

    await this.tokensRepository.delete({
      user: { id: user.id },
      type: TokenType.VERIFICATION,
    });

    const verificationToken = await this.createToken(
      user.id,
      TokenType.VERIFICATION,
    );

    await this.mailService.sendVerificationEmail(
      user.email,
      verificationToken.token,
    );

    return { message: 'Verification email sent successfully' };
  }

  /**
   * Handle forgot password functionality.
   */
  async forgotPassword(email: string) {
    const user = await this.usersRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.tokensRepository.delete({
      user: { id: user.id },
      type: TokenType.PASSWORD_RESET,
    });

    const resetToken = await this.createToken(
      user.id,
      TokenType.PASSWORD_RESET,
    );

    await this.mailService.sendPasswordResetEmail(user.email, resetToken.token);

    return { message: 'Password reset email sent successfully' };
  }

  /**
   * Reset a user's password using a token.
   */
  async resetPassword(token: string, newPassword: string) {
    const resetToken = await this.tokensRepository.findOne({
      where: { token, type: TokenType.PASSWORD_RESET },
      relations: ['user'],
    });

    if (!resetToken) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    this.validatePassword(newPassword);

    const user = resetToken.user;
    user.password = await this.hashPassword(newPassword);
    await this.usersRepository.save(user);

    await this.tokensRepository.remove(resetToken);

    return { message: 'Password updated successfully' };
  }

  /**
   * Validate password strength.
   */
  private validatePassword(password: string) {
    if (!PASSWORD_REGEX.test(password)) {
      throw new BadRequestException(
        'Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character',
      );
    }
  }

  /**
   * Hash a password using bcrypt.
   */
  private async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt();
    return bcrypt.hash(password, salt);
  }

  /**
   * Create a token for a user.
   */
  private async createToken(userId: number, type: TokenType): Promise<Token> {
    const tokenString = randomBytes(32).toString('hex');

    const token = this.tokensRepository.create({
      user: { id: userId },
      token: tokenString,
      type,
      expiresAt: new Date(
        Date.now() + (type === TokenType.PASSWORD_RESET ? 3600000 : 86400000),
      ),
    });

    return this.tokensRepository.save(token);
  }
}