import { Module } from '@nestjs/common';
import { SpellingBeeController } from './spelling-bee.controller';
import { SpellingBeeService } from './spelling-bee.service';
import { UserModule } from './user/user.module';
import { PuzzleModule } from './games/spelling-bee/puzzle/puzzle.module';
import { GameResultModule } from './games/spelling-bee/game-result/game-result.module';

@Module({
  imports: [UserModule, PuzzleModule, GameResultModule],
  controllers: [SpellingBeeController],
  providers: [SpellingBeeService],
  exports: [SpellingBeeService],
})
export class SpellingBeeModule {}
