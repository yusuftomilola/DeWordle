import {
  Controller,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Get,
  Put,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../security/guards/jwt-auth.guard';
import { RolesGuard } from '../../security/guards/rolesGuard/roles.guard';
import { CreateSubAdminDto } from './dto/create-sub-admin.dto';
import { UpdateSubAdminDto } from './dto/update-sub-admin.dto';
import { SubAdminService } from './sub-admin.service';

@Controller('/api/v1/sub-admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SubAdminController {
  constructor(private readonly subAdminService: SubAdminService) {}

  @Post()
  async create(@Body() createSubAdminDto: CreateSubAdminDto) {
    return await this.subAdminService.create(createSubAdminDto);
  }

  @Get()
  async findAll() {
    return await this.subAdminService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.subAdminService.findOne(+id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateAdminDto: UpdateSubAdminDto,
  ) {
    return this.subAdminService.update(+id, updateAdminDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.subAdminService.remove(+id);
  }
}
