import { Module } from '@nestjs/common';
import { HangmanService } from './hangman.service';
import { HangmanController } from './hangman.controller';
import { ScoreModule } from './score/score.module';

@Module({
  controllers: [HangmanController],
  providers: [HangmanService],
  imports: [ScoreModule],
})
export class HangmanModule {}
