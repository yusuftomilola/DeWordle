import { Module } from '@nestjs/common';
import { DewordleModule } from './dewordle/dewordle.module';

@Module({
  imports: [DewordleModule],
})
export class GamesModule {}
