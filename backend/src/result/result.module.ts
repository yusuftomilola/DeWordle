import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResultService } from './result.service';
import { ResultController, StatusResultController } from './result.controller';
import { statusResult } from './entities/result.entity';

@Module({
  imports: [TypeOrmModule.forFeature([statusResult])],
  controllers: [ResultController, StatusResultController],
  providers: [ResultService],
  exports: [ResultService, TypeOrmModule],
})
export class ResultModule {}
