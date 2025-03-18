import { Module } from '@nestjs/common';
import { PaginationService } from './provider/pagination-service.service';

@Module({
  providers: [PaginationService],
  exports: [PaginationService],
})
export class PaginationModule {}
