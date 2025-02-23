import {
  Injectable,
  NotFoundException,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ForbiddenException,
} from '@nestjs/common';
import { CreateSubAdminDto } from './dto/create-sub-admin.dto';
import { UpdateSubAdminDto } from './dto/update-sub-admin.dto';

@Injectable()
export class SubAdminService {
  private subAdmins = [];

  create(createSubAdminDto: CreateSubAdminDto) {
    const newSubAdmin = { id: Date.now(), ...createSubAdminDto };
    this.subAdmins.push(newSubAdmin);
    return newSubAdmin;
  }

  findAll() {
    return this.subAdmins;
  }

  findOne(id: number) {
    const subAdmin = this.subAdmins.find((admin) => admin.id === id);
    if (!subAdmin) {
      throw new NotFoundException(`Sub-Admin with ID ${id} not found`);
    }
    return subAdmin;
  }

  update(id: number, updateSubAdminDto: UpdateSubAdminDto) {
    const subAdminIndex = this.subAdmins.findIndex((admin) => admin.id === id);
    if (subAdminIndex === -1) {
      throw new NotFoundException(`Sub-Admin with ID ${id} not found`);
    }
    this.subAdmins[subAdminIndex] = {
      ...this.subAdmins[subAdminIndex],
      ...updateSubAdminDto,
    };
    return this.subAdmins[subAdminIndex];
  }

  remove(id: number) {
    const subAdminIndex = this.subAdmins.findIndex((admin) => admin.id === id);
    if (subAdminIndex === -1) {
      throw new NotFoundException(`Sub-Admin with ID ${id} not found`);
    }
    this.subAdmins.splice(subAdminIndex, 1);
    return { message: 'Sub-Admin deleted successfully' };
  }
}
