import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SubAdmin } from './entities/sub-admin-entity';
import { CreateSubAdminDto } from './dto/create-sub-admin.dto';
import { UpdateSubAdminDto } from './dto/update-sub-admin.dto';

@Injectable()
export class SubAdminService {
  constructor(
    @InjectRepository(SubAdmin)
    private readonly subAdminRepository: Repository<SubAdmin>,
  ) {}

  async create(dto: CreateSubAdminDto): Promise<Partial<SubAdmin>> {
    const newSubAdmin = this.subAdminRepository.create(dto);
    const savedSubAdmin = await this.subAdminRepository.save(newSubAdmin);
    return {
      id: savedSubAdmin.id,
      name: savedSubAdmin.name,
      role: savedSubAdmin.role,
      email: savedSubAdmin.email,
    };
  }

  async findAll(): Promise<Partial<SubAdmin>[]> {
    const subAdmins = await this.subAdminRepository.find();
    return subAdmins.map(({ id, name, role, email }) => ({
      id,
      name,
      role,
      email,
    }));
  }

  async findOne(id: number): Promise<Partial<SubAdmin> | null> {
    const subAdmin = await this.subAdminRepository.findOne({ where: { id } });
    if (!subAdmin) return null;
    return {
      id: subAdmin.id,
      name: subAdmin.name,
      role: subAdmin.role,
      email: subAdmin.email,
    };
  }

  async update(id: number, updateSubAdminDto: UpdateSubAdminDto) {
    await this.subAdminRepository.update(id, updateSubAdminDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.subAdminRepository.delete(id);
  }
}
