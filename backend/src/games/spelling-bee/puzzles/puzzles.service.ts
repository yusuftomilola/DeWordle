import { Injectable } from '@nestjs/common';

import { CreatePuzzleDto } from './dto/create-puzzle.dto';
import { UpdatePuzzleDto } from './dto/update-puzzle.dto';
import { Puzzle } from './entities/puzzle.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { SubmitWordDto } from './dto/submit-word.dto';
import { WordValidatorService } from './providers/word-validator-service.service';

@Injectable()
export class PuzzlesService {
  constructor(
    @InjectRepository(Puzzle)
    private puzzleRepository: Repository<Puzzle>,
    private wordValidatorService: WordValidatorService,
  ) {}

  create(createPuzzleDto: CreatePuzzleDto) {
    const puzzle = this.puzzleRepository.create({
      ...createPuzzleDto,
    });

    return this.puzzleRepository.save(puzzle);
  }

  findAll() {
    return this.puzzleRepository.find({ order: { date: 'DESC' } });
  }

  findOne(id: number) {
    return this.puzzleRepository.findOneBy({ id });
  }

  findCurrent() {
    return this.puzzleRepository.findOne({
      order: { date: 'DESC' },
      where: { id: MoreThan(0) },
    });
  }

  update(id: number, updatePuzzleDto: UpdatePuzzleDto) {
    return `This action updates a #${id} puzzle`;
  }

  remove(id: number) {
    return `This action removes a #${id} puzzle`;
  }

  async submitWord(id: number, submitWordDto: SubmitWordDto) {
    const puzzle = await this.findOne(id);

    return this.wordValidatorService.validateWord(submitWordDto.word, puzzle);
  }
}
