import { Controller, Get, Param } from '@nestjs/common';
import { WordsService } from './words.service';

@Controller('/api/v1/words')
export class WordsController {
  constructor(private readonly wordsService: WordsService) {}

  @Get('daily')
  getWordOfTheDay() {
    return { word: this.wordsService.getWordOfTheDay() };
  }

  @Get('guess/:word')
  validateGuess(@Param('word') word: string) {
    return this.wordsService.validateGuess(word);
  }
}
