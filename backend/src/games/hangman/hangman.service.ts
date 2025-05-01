import { Injectable } from '@nestjs/common';

@Injectable()
export class HangmanService {
  create() {
    return 'This action adds a new hangman';
  }

  findAll() {
    return `This action returns all hangman`;
  }

  findOne(id: number) {
    return `This action returns a #${id} hangman`;
  }

  update(id: number, ) {
    return `This action updates a #${id} hangman`;
  }

  remove(id: number) {
    return `This action removes a #${id} hangman`;
  }
}
