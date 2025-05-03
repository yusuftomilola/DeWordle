import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './providers/auth.service';
import { SignInDto } from './dto/create-auth.dto';
import { RegisterDto } from './dto/register.dto'; 

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    SignIn: jest.fn(),
    register: jest.fn(),
    refreshToken: jest.fn(),
    verifyEmail: jest.fn(),
    resendVerificationEmail: jest.fn(),
    forgotPassword: jest.fn(),
    resetPassword: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should sign in a user', async () => {
    const signInDto: SignInDto = { email: 'test@example.com', password: 'password123' };
    const result = { token: 'jwt_token' };
    mockAuthService.SignIn.mockResolvedValue(result);
    expect(await controller.SignIn(signInDto)).toEqual(result);
    expect(mockAuthService.SignIn).toHaveBeenCalledWith(signInDto);
  });

  it('should register a user', async () => {
    const registerDto: RegisterDto = {
      email: 'newuser@example.com',
      password: 'password123',
      username: 'newuser',
    };
    const result = { message: 'User registered' };
    mockAuthService.register.mockResolvedValue(result);
    expect(await controller.register(registerDto)).toEqual(result);
    expect(mockAuthService.register).toHaveBeenCalledWith(registerDto);
  });
});