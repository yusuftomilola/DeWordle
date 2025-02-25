import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from "@nestjs/common";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import * as bcrypt from "bcryptjs";
import { Admin } from "./entities/admin.entity";
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from "./dto/update-admin.dto";

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,
  ) {}
  create(_createAdminDto: CreateAdminDto) {
    return 'This action adds a new admin';
  }

  findAll() {
    return `This action returns all admin`;
  }

  findOne(id: number) {
    return `This action returns a #${id} admin`;
  }

  async update(id: number, dto: UpdateAdminDto): Promise<Admin> {
    const admin = await this.adminRepository.findOne({ where: { id: Number(id) } });
    if (!admin) {
      throw new NotFoundException("Admin not found"); // 404 Not Found
    }

    // Prevent unauthorized role updates
    if (dto.role && !admin.isSuperAdmin) {
      throw new ForbiddenException("Only Super Admins can change roles"); // 403 Forbidden
    }

    // Validate data
    if (dto.email && !dto.email.includes("@")) {
      throw new BadRequestException("Invalid email format"); // 400 Bad Request
    }

        // Cannot update password via this endpoint. Must use password reset flow
        if (dto.password) {
          throw new ForbiddenException("Password updates must be done via the password reset flow");
        }

    // Update and save admin
    Object.assign(admin, dto);
    return this.adminRepository.save(admin);
  }

  async remove(id: number): Promise<{ message: string }> {
    const admin = await this.adminRepository.findOne({ where: { id: Number(id) } });
    if (!admin) {
      throw new NotFoundException("Admin not found");
    }

    // Prevent deletion of last super admin
    if (admin.isSuperAdmin) {
      const superAdminCount = await this.adminRepository.count({ where: { isSuperAdmin: true } });
      if (superAdminCount <= 1) {
        throw new BadRequestException("Cannot delete the last Super Admin");
      }
    }

    await this.adminRepository.remove(admin);
    return { message: "Admin deleted successfully" };
  }

  }
