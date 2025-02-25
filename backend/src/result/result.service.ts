import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateResultDto } from './dto/create-result.dto';
import { UpdateResultDto } from './dto/update-result.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Result } from './entities/result.entity';

@Injectable()
export class ResultService {
  constructor(
    @InjectRepository(Result)
    private resultRepository: Repository<Result>,
  ) {}
  create(_createResultDto: CreateResultDto) {
    return 'This action adds a new result';
  }

  findAll() {
    return `This action returns all result`;
  }

  findOne(id: number) {
    return `This action returns a #${id} result`;
  }

  
async updateResult(userId: string, updateResultDto: UpdateResultDto): Promise<Result> {
  const userIdNumber = parseInt(userId, 10);
  if (isNaN(userIdNumber)) {
    throw new BadRequestException(`Invalid userId: ${userId}`);
  }

  const result = await this.resultRepository.findOne({ where: { user: { id: userIdNumber } } });
  if (!result) {
    throw new NotFoundException(`Result entry for user ${userId} not found`);
  }

  // Always increment the number of games played
  result.timesPlayed++;

  if (updateResultDto.won) {
    result.currentStreak++;
    // Increment wins to calculate win percentage later.
    result.wins = (result.wins || 0) + 1;
    // Update maxStreak if the current streak exceeds it
    if (result.currentStreak > result.maxStreak) {
      result.maxStreak = result.currentStreak;
    }
  } else {
    // Reset current streak on loss
    result.currentStreak = 0;
  }

  // Recalculate win percentage
  result.winPercentage = (result.wins / result.timesPlayed) * 100;

  return await this.resultRepository.save(result);
}

async remove(id: number): Promise<{ message: string }> {
  const result = await this.resultRepository.findOne({ where: { id } });
  if (!result) {
    throw new NotFoundException(`Result with id ${id} not found`);
  }
  
  await this.resultRepository.delete(id);
  return { message: `Result with id ${id} has been deleted` };
}
  
}
