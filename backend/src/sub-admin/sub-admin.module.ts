import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubAdmin } from './entities/sub-admin-entity';
import { SubAdminService } from './sub-admin.service';
import { SubAdminController } from './sub-admin.controller';

@Module({
  imports: [TypeOrmModule.forFeature([SubAdmin])],
  controllers: [SubAdminController],
  providers: [SubAdminService],
  exports: [SubAdminService],
})
export class SubAdminModule {}
