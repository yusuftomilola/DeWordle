import { Injectable } from '@nestjs/common';
import { CreateGamemodeDto } from './dto/create-gamemode.dto';
import { UpdateGamemodeDto } from './dto/update-gamemode.dto';

@Injectable()
export class GamemodeService {
  create(createGamemodeDto: CreateGamemodeDto) {
    return 'This action adds a new gamemode';
  }

  findAll() {
    return `This action returns all gamemode`;
  }

  findOne(id: number) {
    return `This action returns a #${id} gamemode`;
  }

  update(id: number, updateGamemodeDto: UpdateGamemodeDto) {
    return `This action updates a #${id} gamemode`;
  }

  remove(id: number) {
    return `This action removes a #${id} gamemode`;
  }
}
