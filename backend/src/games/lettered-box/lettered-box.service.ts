import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LetteredBoxEntity } from './entities/lettered-box.entity';
import { SubmitSolutionDto } from './dto/submit-solution-dto';

@Injectable()
export class LetteredBoxService {
  constructor(
    @InjectRepository(LetteredBoxEntity)
    private gameRepo: Repository<LetteredBoxEntity>,
  ) {}

  async validateSolution(
    dto: SubmitSolutionDto,
    userId: string,
  ): Promise<{ isValid: boolean; wordCount: number; message: string }> {
    const words = dto.words;
    const wordCount = words.length;

    if (wordCount === 0) {
      return { isValid: false, wordCount, message: 'No words submitted.' };
    }

    const usedLetters = new Set(words.join('').toUpperCase());

    // Mock rule: minimum 4 unique letters used
    if (usedLetters.size < 4) {
      return {
        isValid: false,
        wordCount,
        message: 'Use more unique letters from the board.',
      };
    }

    // Basic chaining rule: last letter of word[i] == first letter of word[i+1]
    for (let i = 0; i < words.length - 1; i++) {
      const lastChar = words[i].slice(-1);
      const nextFirst = words[i + 1][0];
      if (lastChar !== nextFirst) {
        return {
          isValid: false,
          wordCount,
          message: `Word ${words[i + 1]} must begin with '${lastChar}'`,
        };
      }
    }

    return { isValid: true, wordCount, message: 'Valid solution!' };
  }

  async submitSolution(
    dto: SubmitSolutionDto,
    userId: string,
  ): Promise<{ isValid: boolean; wordCount: number; message: string }> {
    const validation = await this.validateSolution(dto, userId);

    const game = this.gameRepo.create({
      userId,
      board: {
        top: ['A', 'B', 'C'],
        right: ['D', 'E', 'F'],
        bottom: ['G', 'H', 'I'],
        left: ['J', 'K', 'L'],
      }, // temp hardcoded board
      submittedWords: dto.words,
      wordCount: validation.wordCount,
      isValid: validation.isValid,
    });

    await this.gameRepo.save(game);

    return validation;
  }

  async getLeaderboard() {
    return this.gameRepo.find({
      where: { isValid: true },
      order: { wordCount: 'ASC' },
      take: 10,
      select: ['userId', 'wordCount', 'playedAt'],
    });
  }
}
