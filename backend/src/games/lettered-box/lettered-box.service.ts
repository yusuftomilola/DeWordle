import { Injectable } from '@nestjs/common';
import { CreateLetteredBoxDto } from './dto/create-lettered-box.dto';
import { UpdateLetteredBoxDto } from './dto/update-lettered-box.dto';

@Injectable()
export class LetteredBoxService {
  create(createLetteredBoxDto: CreateLetteredBoxDto) {
    return 'This action adds a new letteredBox';
  }

  findAll() {
    return `This action returns all letteredBox`;
  }

  findOne(id: number) {
    return `This action returns a #${id} letteredBox`;
  }

  update(id: number, updateLetteredBoxDto: UpdateLetteredBoxDto) {
    return `This action updates a #${id} letteredBox`;
  }

  remove(id: number) {
    return `This action removes a #${id} letteredBox`;
  }
}
