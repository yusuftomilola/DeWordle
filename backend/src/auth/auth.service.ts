import { SignInDto } from './dto/create-auth.dto';
import { Injectable } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  async login(SignInDto: SignInDto) {
    return { message: 'Login successful', token: 'jwt_token' };
  }

  async register(registerDto: RegisterDto) {
    return { message: 'Registration successful', user: registerDto };
  }
}