import { Injectable } from '@nestjs/common';
import { LoginDto } from './dto/register.dto.ts';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  async login(loginDto: LoginDto) {
    return { message: 'Login successful', token: 'jwt_token' };
  }

  async register(registerDto: RegisterDto) {
    return { message: 'Registration successful', user: registerDto };
  }
}