import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  ParseIntPipe,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { GamesService } from './games.service';
import { type CreateGameDto } from './dto/create-game.dto';
import { type UpdateGameDto } from './dto/update-game.dto';
import { Roles } from 'src/auth/decorators/roles.decorators';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-guard.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { toGameDto } from '../common/dto/response-mappers';

@Controller('games')
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  async create(@Body() dto: CreateGameDto) {
    return toGameDto(await this.gamesService.create(dto));
  }

  @Get()
  async findAll() {
    return (await this.gamesService.findAll()).map(toGameDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateGameDto,
  ) {
    return toGameDto(await this.gamesService.update(id, dto));
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.gamesService.remove(id);
    return { id, deleted: true };
  }
}
