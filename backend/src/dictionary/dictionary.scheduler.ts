import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DictionaryService } from './dictionary.service';

@Injectable()
export class DictionaryScheduler {
  constructor(private readonly dictionaryService: DictionaryService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleDailyWordFetch() {
    await this.dictionaryService.fetchWordsFromExternalAPI();
  }
}
