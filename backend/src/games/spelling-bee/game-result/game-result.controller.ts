import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { GameResultService } from './game-result.service';
import { CreateGameResultDto } from './dto/create-game-result.dto';
import { UpdateGameResultDto } from './dto/update-game-result.dto';

@Controller('game-result')
export class GameResultController {
  constructor(private readonly gameResultService: GameResultService) {}

  @Post()
  create(@Body() createGameResultDto: CreateGameResultDto) {
    return this.gameResultService.create(createGameResultDto);
  }

  @Get()
  findAll() {
    return this.gameResultService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.gameResultService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateGameResultDto: UpdateGameResultDto) {
    return this.gameResultService.update(+id, updateGameResultDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.gameResultService.remove(+id);
  }
}
