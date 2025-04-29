import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { LetteredBoxService } from './lettered-box.service';
import { CreateLetteredBoxDto } from './dto/create-lettered-box.dto';
import { UpdateLetteredBoxDto } from './dto/update-lettered-box.dto';

@Controller('lettered-box')
export class LetteredBoxController {
  constructor(private readonly letteredBoxService: LetteredBoxService) {}

  @Post()
  create(@Body() createLetteredBoxDto: CreateLetteredBoxDto) {
    return this.letteredBoxService.create(createLetteredBoxDto);
  }

  @Get()
  findAll() {
    return this.letteredBoxService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.letteredBoxService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLetteredBoxDto: UpdateLetteredBoxDto) {
    return this.letteredBoxService.update(+id, updateLetteredBoxDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.letteredBoxService.remove(+id);
  }
}
