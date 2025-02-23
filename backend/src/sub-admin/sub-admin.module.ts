import { Module } from '@nestjs/common';
import { SubAdminService } from './sub-admin.service';
import { SubAdminController } from './sub-admin.controller';

@Module({
  controllers: [SubAdminController],
  providers: [SubAdminService],
})
export class SubAdminModule {}
