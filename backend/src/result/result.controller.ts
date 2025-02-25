import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe
} from '@nestjs/common';
import { ResultService } from './result.service';
import { CreateResultDto } from './dto/create-result.dto';
import { UpdateResultDto } from './dto/update-result.dto';

@Controller('result')
export class ResultController {
  constructor(private readonly resultService: ResultService) {}

  @Post()
  create(@Body() createResultDto: CreateResultDto) {
    return this.resultService.create(createResultDto);
  }

  @Get()
  findAll() {
    return this.resultService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.resultService.findOne(+id);
  }

  @Patch(':userId')
  updateResult(
    @Param('userId') userId: string,
    @Body() updateResultDto: UpdateResultDto,
  ) {
    return this.resultService.updateResult(userId, updateResultDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.resultService.remove(id);
  }
}
