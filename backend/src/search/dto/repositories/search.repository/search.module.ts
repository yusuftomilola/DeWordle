import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { SearchController } from './search.controller';

@Module({
  imports: [TypeOrmModule.forFeature([]), ConfigModule],
  controllers: [SearchController],
  providers: [ ],
  exports: [],
})
export class SearchModule {}
