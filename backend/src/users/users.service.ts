import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { FindOneByEmailProvider } from './providers/find-one-by-email.provider';
import { UpdateUserDto } from './dto/update-user.dto';
import { FindOneByGoogleIdProvider } from './providers/find-one-by-google-id-provider';
import { CreateGoogleUserProvider } from './providers/create-google-user-provider';
import { GoogleInterface } from 'src/auth/social/interfaces/user.interface';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,

    private readonly findOneByEmailProvider: FindOneByEmailProvider,
    private readonly findOneByGoogleIdProvider: FindOneByGoogleIdProvider,
    private readonly createGoogleUserProvider: CreateGoogleUserProvider,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    const user = this.userRepository.create(createUserDto);
    return this.userRepository.save(user);
  }

  public async GetOneByEmail(email: string) {
    const user = await this.findOneByEmailProvider.FindByEmail(email);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findAll(page: number, limit: number) {
    const [users, count] = await this.userRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { id: 'ASC' },
    });

    if (users.length === 0) {
      throw new NotFoundException('No users found');
    }

    return { users, count };
  }

  async softDelete(id: number) {
    const result = await this.userRepository.softDelete(id);

    if (!result.affected) {
      throw new NotFoundException('User not found');
    }

    return { message: 'User soft deleted successfully' };
  }

  public async findOneById(id: number): Promise<User> {
    const user = await this.userRepository.findOneBy({ id });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  public async findOneByGoogleId(googleId: string) {
    const user =
      await this.findOneByGoogleIdProvider.findOneByGoogleId(googleId);

    if (!user) {
      throw new NotFoundException('Google user not found');
    }

    return user;
  }

  public async createGoogleUser(googleUser: GoogleInterface) {
    return this.createGoogleUserProvider.createGoogleUser(googleUser);
  }

  async remove(id: number) {
    const result = await this.userRepository.delete(id);

    if (!result.affected) {
      throw new NotFoundException('User not found');
    }

    return { message: 'User deleted successfully' };
  }

  public async updateUser(
    id: number,
    updateUserDto: UpdateUserDto,
  ): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (updateUserDto.email) {
      const existingUser = await this.userRepository.findOne({
        where: { email: updateUserDto.email },
      });

      if (existingUser && existingUser.id !== id) {
        throw new BadRequestException('Email already in use');
      }
    }

    Object.assign(user, updateUserDto);
    return this.userRepository.save(user);
  }
}
