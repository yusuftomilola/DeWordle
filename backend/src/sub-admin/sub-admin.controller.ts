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

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateSubAdminDto: UpdateSubAdminDto,
  ) {
    return await this.subAdminService.update(+id, updateSubAdminDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.subAdminService.remove(+id);
    return { message: 'Sub-admin deleted successfully' };
  }
}
