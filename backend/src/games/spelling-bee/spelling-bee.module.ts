import { Module } from '@nestjs/common';
import { WordValidatorService } from './providers/word-validator-service.service';
import { DictionaryModule } from 'src/dictionary/dictionary.module';
import { SpellingBeeController } from './spelling-bee.controller';

@Module({
  imports: [DictionaryModule],
  providers: [WordValidatorService],
  exports: [WordValidatorService],
  controllers: [SpellingBeeController]
})
export class SpellingBeeModule {}
