import {
  Controller,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Get,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../security/jwt-auth.guard';
import { RolesGuard } from '../../security/roles.guard';
import { CreateSubAdminDto } from './dto/create-sub-admin.dto';
import { UpdateSubAdminDto } from './dto/update-sub-admin.dto';
import { SubAdminService } from './sub-admin.service';

@Controller('sub-admins')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SubAdminController {
  constructor(private readonly subAdminService: SubAdminService) {}

  @Post()
  create(@Body() createSubAdminDto: CreateSubAdminDto) {
    return this.subAdminService.create(createSubAdminDto);
  }

  @Get()
  findAll() {
    return this.subAdminService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.subAdminService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateSubAdminDto: UpdateSubAdminDto,
  ) {
    return this.subAdminService.update(+id, updateSubAdminDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.subAdminService.remove(+id);
  }
}
