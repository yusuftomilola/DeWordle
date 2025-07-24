import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WordsService } from './words.service';
import { WordsController } from './words.controller';
import { Word } from '../../entities/word.entity';
import { WordSeedService } from '../../utils/word-seed.service';
import { WordScheduler } from './word.scheduler';

@Module({
  imports: [TypeOrmModule.forFeature([Word])],
  controllers: [WordsController],
  providers: [WordsService, WordSeedService, WordScheduler],
  exports: [WordsService, WordSeedService],
})
export class WordsModule {}
