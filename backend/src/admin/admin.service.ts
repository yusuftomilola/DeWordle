import { Injectable } from '@nestjs/common';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from "./dto/update-admin.dto";

@Injectable()
export class AdminService {
  create(_createAdminDto: CreateAdminDto) {
    return 'This action adds a new admin';
  }

  async findAll(): Promise<Partial<Admin>[]> {
    return await this.adminRepository.find({
      select: ['id', 'username', 'role', 'email'],
    });
  }

  async findOne(id: number): Promise<Partial<Admin> | null> {
    return await this.adminRepository.findOne({
      where: { id },
      select: ['id', 'username', 'role', 'email'],
    });
  }

  update(id: number, _updateAdminDto: UpdateAdminDto) {
    return `This action updates a #${id} admin`;
  }

  remove(id: number) {
    return `This action removes a #${id} admin`;
  }
}
