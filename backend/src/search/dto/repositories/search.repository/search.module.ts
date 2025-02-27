import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SearchService } from './search.service';
import { ConfigModule } from '@nestjs/config';
import { SearchRepository } from './search.repository';
import { SearchController } from './search.controller';

@Module({
  imports: [TypeOrmModule.forFeature([]), ConfigModule],
  controllers: [SearchController],
  providers: [SearchService, SearchRepository],
  exports: [SearchService],
})
export class SearchModule {}
