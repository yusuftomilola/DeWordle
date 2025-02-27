import { Injectable, NotFoundException, UseFilters } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Admin } from '../entities/admin.entity';
import { CreateAdminDto } from '../dto/create-admin.dto';
import { UpdateAdminDto } from '../dto/update-admin.dto';
import * as bcrypt from 'bcrypt';
import {
  AllExceptionsFilter,
  DatabaseExceptionFilter,
  ValidationExceptionFilter,
} from 'src/common/filters';

@Injectable()
@UseFilters(
  DatabaseExceptionFilter,
  ValidationExceptionFilter,
  AllExceptionsFilter,
)
export class AdminService {
  constructor(
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,
  ) {}

  async createAdmin(createAdminDto: CreateAdminDto) {
    const hashedPassword = await bcrypt.hash(createAdminDto.password, 10);

    const newAdmin = this.adminRepository.create({
      ...createAdminDto,
      password: hashedPassword,
    });

    const savedAdmin = await this.adminRepository.save(newAdmin);
    return {
      message: 'Admin created successfully',
      adminId: savedAdmin.id,
    };
  }

  async findAll(): Promise<Partial<Admin>[]> {
    const admins = await this.adminRepository.find({
      select: ['id', 'username', 'role', 'email'],
    });
    return admins.length > 0 ? admins : [];
  }

  async findOne(id: number): Promise<Partial<Admin> | null> {
    const admin = await this.adminRepository.findOne({
      where: { id },
      select: ['id', 'username', 'role', 'email'],
    });

    if (!admin) {
      throw new NotFoundException(`Admin with ID ${id} not found`);
    }

    return admin;
  }

  async findOneByEmail(email: string): Promise<Admin | undefined> {
    return this.adminRepository.findOne({ where: { email } });
  }

  async findOneById(id: number): Promise<Admin | undefined> {
    return this.adminRepository.findOne({ where: { id } });
  }

  async setRefreshToken(id: number, refreshToken: string): Promise<void> {
    await this.adminRepository.update(id, { refreshToken });
  }

  async setResetToken(
    id: number,
    resetToken: string,
    resetTokenExpiry: Date,
  ): Promise<void> {
    await this.adminRepository.update(id, { resetToken, resetTokenExpiry });
  }

  async updatePassword(id: number, password: string): Promise<void> {
    await this.adminRepository.update(id, {
      password,
      resetToken: null,
      resetTokenExpiry: null,
    });
  }

  async setVerificationToken(
    id: number,
    verificationToken: string,
    verificationTokenExpiry: Date,
  ): Promise<void> {
    await this.adminRepository.update(id, {
      verificationToken,
      verificationTokenExpiry,
    });
  }

  async verifyEmail(id: number): Promise<void> {
    await this.adminRepository.update(id, {
      emailVerified: true,
      verificationToken: null,
      verificationTokenExpiry: null,
    });
  }

  async update(id: number, updateAdminDto: UpdateAdminDto) {
    const admin = await this.adminRepository.findOne({ where: { id } });

    if (!admin) {
      throw new NotFoundException('Admin not found');
    }

    if (updateAdminDto.password) {
      updateAdminDto.password = await bcrypt.hash(updateAdminDto.password, 10);
    }

    await this.adminRepository.update(id, updateAdminDto);

    return {
      message: 'Admin details updated successfully',
      adminId: id,
    };
  }

  async remove(id: number) {
    const admin = await this.adminRepository.findOne({ where: { id } });

    if (!admin) {
      throw new NotFoundException('Admin not found');
    }

    await this.adminRepository.delete(id);

    return { message: 'Admin deleted successfully', adminId: id };
  }
}
