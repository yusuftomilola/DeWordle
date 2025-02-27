import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DictionaryController } from './dictionary.controller';
import { DictionaryService } from './dictionary.service';
import { DictionaryWord } from './entities/dictionary-word.entity';
import { PendingWord } from './entities/pending-word.entity';
import { DictionaryScheduler } from './dictionary.scheduler';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';

@Module({
  imports: [
    TypeOrmModule.forFeature([DictionaryWord, PendingWord]),
    CacheModule.register({
      store: redisStore,
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT) || 6379,
      ttl: 3600, // 1 hour cache
    }),
  ],
  controllers: [DictionaryController],
  providers: [DictionaryService, DictionaryScheduler],
  exports: [DictionaryService],
})
export class DictionaryModule {}
