import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { CreateUsersProvider } from './providers/create-users-provider';
import { Repository } from 'typeorm';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly createUserProvider: CreateUsersProvider,
    @InjectRepository(User) private userRepository: Repository<User>,
    @Inject(forwardRef(() => AuthService)) private authService: AuthService, 
  ) {}

  create(createUserDto: CreateUserDto) {
    return this.createUserProvider.createUser(createUserDto);
  }

  findAll() {
    return 'This action returns all users';
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
