import { Module } from '@nestjs/common';
import { LetteredBoxService } from './lettered-box.service';
import { LetteredBoxController } from './lettered-box.controller';
import { LetteredBoxEntity } from './entities/lettered-box.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([LetteredBoxEntity])],
  controllers: [LetteredBoxController],
  providers: [LetteredBoxService],
})
export class LetteredBoxModule {}
