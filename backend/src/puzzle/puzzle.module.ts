import { Module } from '@nestjs/common';
import { PuzzleService } from './puzzle.service';
import { PuzzleController } from './puzzle.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Puzzle } from './entities/puzzle.entity';
import { PuzzleSession } from './entities/puzzle-session.entity';
import { DictionaryService } from '../dictionary/dictionary.service';

@Module({
  imports: [TypeOrmModule.forFeature([Puzzle, PuzzleSession])],
  controllers: [PuzzleController],
  providers: [PuzzleService, DictionaryService],
  exports: [PuzzleService],
})
export class PuzzleModule {}
