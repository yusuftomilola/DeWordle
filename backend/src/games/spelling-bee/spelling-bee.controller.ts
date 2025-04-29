// spelling-bee.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { WordValidatorService } from './providers/word-validator-service.service';

@Controller('spelling-bee')
export class SpellingBeeController {
  constructor(private readonly wordValidatorService: WordValidatorService) {}

  @Post('submit-word')
  validateWord(@Body() body: any) {
    const { word, puzzle } = body;
    return this.wordValidatorService.validateWord(word, puzzle);
  }
}