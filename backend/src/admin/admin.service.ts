import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Admin } from './entities/admin.entity'; // Import Admin entity
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>, // ✅ Inject Repository
  ) {}

  async createAdmin(dto: CreateAdminDto): Promise<Partial<Admin>> {
    const newAdmin = this.adminRepository.create(dto);
    const savedAdmin = await this.adminRepository.save(newAdmin);

    // ✅ Return only selected fields
    return {
      id: savedAdmin.id,
      username: savedAdmin.username,
      role: savedAdmin.role,
      email: savedAdmin.email,
    };
  }

  async findAll(): Promise<Partial<Admin>[]> {
    return await this.adminRepository.find({
      select: ['id', 'username', 'role', 'email'], // ✅ Select only required fields
    });
  }

  async findOne(id: number): Promise<Partial<Admin> | null> {
    return await this.adminRepository.findOne({
      where: { id },
      select: ['id', 'username', 'role', 'email'], // ✅ Select only required fields
    });
  }

  async update(
    id: number,
    updateAdminDto: UpdateAdminDto,
  ): Promise<Partial<Admin>> {
    await this.adminRepository.update(id, updateAdminDto);
    const updatedAdmin = await this.findOne(id);

    return updatedAdmin ? updatedAdmin : null;
  }

  async remove(id: number): Promise<void> {
    await this.adminRepository.delete(id);
  }
}
