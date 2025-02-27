import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { GamemodeService } from './gamemode.service';
import { CreateGamemodeDto } from './dto/create-gamemode.dto';
import { UpdateGamemodeDto } from './dto/update-gamemode.dto';

@Controller('gamemode')
export class GamemodeController {
  constructor(private readonly gamemodeService: GamemodeService) {}

  @Post()
  create(@Body() createGamemodeDto: CreateGamemodeDto) {
    return this.gamemodeService.create(createGamemodeDto);
  }

  @Get()
  findAll() {
    return this.gamemodeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.gamemodeService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateGamemodeDto: UpdateGamemodeDto) {
    return this.gamemodeService.update(+id, updateGamemodeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.gamemodeService.remove(+id);
  }
}
