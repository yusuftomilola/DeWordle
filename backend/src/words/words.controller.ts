import { Controller, Get, Param } from '@nestjs/common';
import { WordsService } from './words.service';

@Controller('/words')
export class WordsController {
  constructor(private readonly wordsService: WordsService) {}

  @Get('daily')
  getWordOfTheDay() {
    const word = this.wordsService.getWordOfTheDay();
    return { word };
  }

  @Get('guess/:word')
  validateGuess(@Param('word') word: string) {
    return this.wordsService.validateGuess(word);
  }
}
