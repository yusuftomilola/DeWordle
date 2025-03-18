import {
  forwardRef,
  Inject,
  Injectable,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
import jwtConfig from 'config/jwt.config';
import { GoogleTokenDto } from '../dtos/google-token-dto';
import { GenerateTokenProvider } from 'src/auth/providers/generate-token.provider';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class GoogleAuthenticationService implements OnModuleInit {
  private oAuthClient: OAuth2Client;
  constructor(
    /**
     * inject userService
     */
    @Inject(forwardRef(() => UsersService))
    private readonly userService: UsersService,

    /**
     * inject jwtconfig
     */
    @Inject(jwtConfig.KEY)
    private readonly jwtConfigurattion: ConfigType<typeof jwtConfig>,
    /**
     * inject generateTokensProvider
     */
    private readonly generateTokensProvider: GenerateTokenProvider,
  ) {}

  onModuleInit() {
    const client_id = this.jwtConfigurattion.googleClient_id;
    const client_secret = this.jwtConfigurattion.googleClient_secret;

    this.oAuthClient = new OAuth2Client(client_id, client_secret);
  }
  public async authenticate(googleTokenDto: GoogleTokenDto) {
    try {
      console.log('Received Token:', googleTokenDto.token);

      // verify the google token sent by user
      const loginTicket = await this.oAuthClient.verifyIdToken({
        idToken: googleTokenDto.token,
      });

      console.log('Google Token Payload:', loginTicket.getPayload());

      // extract the payload from google jwt token
      const {
        email,
        sub: googleId,
        given_name: firstName,
        family_name: lastName,
      } = loginTicket.getPayload();

      // find the user in the database using googleId
      const user = await this.userService.findOneByGoogleId(googleId);

      // if user exist, generate token
      if (user) {
        return this.generateTokensProvider.generateTokens(user);
      }
      // else generate the user and create the token
      const newUser = await this.userService.createGoogleUser({
        email: email,
        firstName: firstName,
        lastName: lastName,
        googleId: googleId,
      });
      return this.generateTokensProvider.generateTokens(newUser);
    } catch (error) {
      // if any of the step fails, send an unauthorised exception
      console.error('Google Auth Error:', error);
      throw new UnauthorizedException('failed to authenticate with google');
    }
  }
}
