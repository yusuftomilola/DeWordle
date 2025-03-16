import { ConflictException, Injectable } from '@nestjs/common';
import { GoogleInterface } from 'src/auth/social/interfaces/user.interface';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class CreateGoogleUserProvider {
  constructor(
    /*
     * inject userRepository
     */
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  public async createGoogleUser(googleUser: GoogleInterface) {
    try {
      const user = this.userRepository.create(googleUser);
      return await this.userRepository.save(user);
    } catch (error) {
      throw new ConflictException(error, {
        description: 'could not create a new user',
      });
    }
  }
}
