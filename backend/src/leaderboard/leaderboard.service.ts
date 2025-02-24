import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common';
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
    const user = await this.userServices.findOneById(
      createLeaderboardDto.userId,
    );
    if (!user) {
      throw new Error('User not found');
    }
    const leaderboardEntry = this.leaderboardRepository.create({
      ...createLeaderboardDto,
      user,
    });
    return this.leaderboardRepository.save(leaderboardEntry);
  }

  create(_createLeaderboardDto: CreateLeaderboardDto) {
    return 'This action adds a new leaderboard';
  }

  findAll() {
    return `This action returns all leaderboard`;
  }

  findOne(id: number) {
    return `This action returns a #${id} leaderboard`;
  }
  async update(
    id: number,
    updateDto: UpdateLeaderboardDto,
  ): Promise<Leaderboard> {
    const existingEntry = await this.leaderboardRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!existingEntry) {
      throw new NotFoundException(`Leaderboard entry with ID ${id} not found`);
    }

    try {
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
    } catch {
      throw new DatabaseErrorException('Failed to update leaderboard entry');
    }
  }

  remove(id: number) {
    return `This action removes a #${id} leaderboard`;
  }
}
