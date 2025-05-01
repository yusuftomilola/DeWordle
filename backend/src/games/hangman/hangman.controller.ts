import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { HangmanService } from './hangman.service';

@Controller('hangman')
export class HangmanController {
  constructor(private readonly hangmanService: HangmanService) {}

  @Post()
  create(@Body() body: any) {
    return this.hangmanService.create();
  }

  @Get()
  findAll() {
    return this.hangmanService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.hangmanService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.hangmanService.update(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.hangmanService.remove(+id);
  }
}
