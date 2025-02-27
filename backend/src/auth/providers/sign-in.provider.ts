import {
  forwardRef,
  Inject,
  Injectable,
  RequestTimeoutException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { HashingProvider } from './hashing-provider';
import { GenerateTokenProvider } from './generate-token.provider';
import { SignInDto } from '../dto/create-auth.dto';
import { SubAdminService } from 'src/sub-admin/sub-admin.service';
import { InjectRepository } from '@nestjs/typeorm';
import { SubAdmin } from 'src/sub-admin/entities/sub-admin-entity';
import { Repository } from 'typeorm';

@Injectable()
export class SignInProvider {
  constructor(
    // circular dependency injection
    @Inject(forwardRef(() => UsersService))
    private readonly userServices: UsersService,

    // intra dependency injection of hash provider
    private readonly hashingProvider: HashingProvider,

    // inter dependency injection of genrate token provider
    private readonly generateTokensProvider: GenerateTokenProvider,
    
    // inter dependency injection of genrate token provider
    private readonly subAdminService: SubAdminService,
  ) {}

  public async SignIn(signInDto: SignInDto) {
    // find the user in the database by the email
    // throw an error
    const user = await this.userServices.GetOneByEmail(signInDto.email);
    const subAdmin = await this.subAdminService.findOneByEmail(signInDto.email);

    if (!user && !subAdmin) {
      throw new UnauthorizedException('Email/Password is incorrect');
    }

    const account = user || subAdmin; // Determine which one exists

    if (!account) {
      throw new UnauthorizedException('No account found with this email');
    }
    
    // Check if email is verified
    if (!user.isVerified) {
      throw new UnauthorizedException('Please verify your email before logging in');
    }

    // compare the password to the hash
    let isEqual: boolean = false;
    try {
      isEqual = await this.hashingProvider.comparePassword(
        signInDto.password,
        user.password,
      );
    } catch (error) {
      throw new RequestTimeoutException(error, {
        description: 'error connecting to the database',
      });
    }
    // send a confirmation
    if (!isEqual) {
      throw new UnauthorizedException('Email/Password is incorrect');
    }
    const tokens = await this.generateTokensProvider.generateTokens(user);
    return [tokens, user];
  }
}
