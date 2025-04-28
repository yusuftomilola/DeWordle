import { Module } from '@nestjs/common';
import { SpellingBeeController } from './spelling-bee.controller';
import { SpellingBeeService } from './spelling-bee.service';

@Module({
  imports: [],
  controllers: [SpellingBeeController],
  providers: [SpellingBeeService],
  exports: [SpellingBeeService]
})
export class SpellingBeeModule {}
