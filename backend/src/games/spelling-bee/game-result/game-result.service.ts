import { Injectable } from '@nestjs/common';
import { CreateGameResultDto } from './dto/create-game-result.dto';
import { UpdateGameResultDto } from './dto/update-game-result.dto';

@Injectable()
export class GameResultService {
  create(createGameResultDto: CreateGameResultDto) {
    return 'This action adds a new gameResult';
  }

  findAll() {
    return `This action returns all gameResult`;
  }

  findOne(id: number) {
    return `This action returns a #${id} gameResult`;
  }

  update(id: number, updateGameResultDto: UpdateGameResultDto) {
    return `This action updates a #${id} gameResult`;
  }

  remove(id: number) {
    return `This action removes a #${id} gameResult`;
  }
}
