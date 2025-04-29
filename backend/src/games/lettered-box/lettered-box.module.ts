import { Module } from '@nestjs/common';
import { LetteredBoxService } from './lettered-box.service';
import { LetteredBoxController } from './lettered-box.controller';

@Module({
  controllers: [LetteredBoxController],
  providers: [LetteredBoxService],
})
export class LetteredBoxModule {}
