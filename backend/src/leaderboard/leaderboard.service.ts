/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateLeaderboardDto } from './dto/create-leaderboard.dto';
import { UpdateLeaderboardDto } from './dto/update-leaderboard.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Leaderboard } from './entities/leaderboard.entity';
import { UsersService } from 'src/users/users.service';
import { DatabaseErrorException } from '../common/exceptions/database-error.exception';

@Injectable()
export class LeaderboardService {
  constructor(
    @InjectRepository(Leaderboard)
    private leaderboardRepository: Repository<Leaderboard>,

    @Inject(forwardRef(() => UsersService))
    private readonly userServices: UsersService,
  ) {}

  async createLeaderboard(
    createLeaderboardDto: CreateLeaderboardDto,
  ): Promise<Leaderboard> {
    try {
      const user = await this.userServices.findOneById(
        createLeaderboardDto.userId,
      );

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const leaderboardEntry = this.leaderboardRepository.create({
        ...createLeaderboardDto,
        user,
      });

      return await this.leaderboardRepository.save(leaderboardEntry);
    } catch (error) {
      throw new DatabaseErrorException('Failed to create leaderboard entry');
    }
  }

  async findAll(): Promise<Leaderboard[]> {
    try {
      const leaderboardEntries = await this.leaderboardRepository.find({
        relations: ['user'],
      });

      if (!leaderboardEntries.length) {
        throw new NotFoundException('No leaderboard entries found');
      }

      return leaderboardEntries;
    } catch (error) {
      throw new DatabaseErrorException('Failed to fetch leaderboard entries');
    }
  }

  async findOne(id: number): Promise<Leaderboard> {
    try {
      const leaderboardEntry = await this.leaderboardRepository.findOne({
        where: { id },
        relations: ['user'],
      });

      if (!leaderboardEntry) {
        throw new NotFoundException(
          `Leaderboard entry with ID ${id} not found`,
        );
      }

      return leaderboardEntry;
    } catch (error) {
      throw new DatabaseErrorException('Failed to fetch leaderboard entry');
    }
  }

  async update(
    id: number,
    updateDto: UpdateLeaderboardDto,
  ): Promise<Leaderboard> {
    try {
      const existingEntry = await this.leaderboardRepository.findOne({
        where: { id },
        relations: ['user'],
      });

      if (!existingEntry) {
        throw new NotFoundException(
          `Leaderboard entry with ID ${id} not found`,
        );
      }

      const updateData = {
        totalWins: updateDto.totalWins,
        totalAttempts: updateDto.totalAttempts,
        averageScore: updateDto.averageScore,
        user: updateDto.userId ? { id: updateDto.userId } : undefined,
      };

      const mergedEntry = this.leaderboardRepository.merge(
        existingEntry,
        updateData,
      );
      return await this.leaderboardRepository.save(mergedEntry);
    } catch (error) {
      throw new DatabaseErrorException('Failed to update leaderboard entry');
    }
  }

  async remove(id: number): Promise<{ message: string }> {
    try {
      const result = await this.leaderboardRepository.delete(id);

      if (!result.affected) {
        throw new NotFoundException(
          `Leaderboard entry with ID ${id} not found`,
        );
      }

      return { message: 'Leaderboard entry deleted successfully' };
    } catch (error) {
      throw new DatabaseErrorException('Failed to delete leaderboard entry');
    }
  }
}
