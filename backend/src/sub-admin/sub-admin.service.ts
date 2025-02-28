import {
  Injectable,
  NotFoundException,
  RequestTimeoutException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { SubAdmin } from './entities/sub-admin-entity';
import { CreateSubAdminDto } from './dto/create-sub-admin.dto';
import { UpdateSubAdminDto } from './dto/update-sub-admin.dto';
import { MailService } from 'src/mail/providers/mail.service';
import { ResetPsswordService } from './providers/reset-pssword.service';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class SubAdminService {
  constructor(
    @InjectRepository(SubAdmin)
    private readonly subAdminRepository: Repository<SubAdmin>,

    // inject mailService
    private readonly mailService: MailService,

    private readonly resetPasswordReset: ResetPsswordService,
  ) {}

  async create(dto: CreateSubAdminDto): Promise<Partial<SubAdmin>> {
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const newSubAdmin = this.subAdminRepository.create({
      ...dto,
      password: hashedPassword,
    });

    const savedSubAdmin = await this.subAdminRepository.save(newSubAdmin);

    try {
      await this.mailService.welcomeEmail(newSubAdmin);
    } catch (error) {
      throw new RequestTimeoutException(error);
    }

    return {
      id: savedSubAdmin.id,
      name: savedSubAdmin.name,
      role: savedSubAdmin.role,
      email: savedSubAdmin.email,
    };
  }

  async findOneByEmail(email: string): Promise<SubAdmin | null> {
    return await this.subAdminRepository.findOne({ where: { email } });
  }

  public async findOneById(id: number): Promise<SubAdmin | null> {
    return await this.subAdminRepository.findOneBy({ id });
  }

  async findAll(): Promise<Partial<SubAdmin>[]> {
    const subAdmins = await this.subAdminRepository.find({
      select: ['id', 'name', 'role', 'email'],
    });

    return subAdmins.length > 0 ? subAdmins : [];
  }

  async findOne(id: number): Promise<Partial<SubAdmin>> {
    const subAdmin = await this.subAdminRepository.findOne({
      where: { id },
      select: ['id', 'name', 'role', 'email'],
    });

    if (!subAdmin) {
      throw new NotFoundException('Sub-admin not found');
    }

    return subAdmin;
  }

  async update(id: number, updateAdminDto: UpdateSubAdminDto) {
    const admin = await this.subAdminRepository.findOne({ where: { id } });

    if (!admin) {
      throw new NotFoundException('Sub-admin not found');
    }

    if (updateAdminDto.password) {
      updateAdminDto.password = await bcrypt.hash(updateAdminDto.password, 10);
    }

    await this.subAdminRepository.update(id, updateAdminDto);

    return {
      message: 'Sub-admin details updated successfully',
      subAdminId: id,
    };
  }

  async remove(id: number): Promise<{ message: string }> {
    const subAdmin = await this.subAdminRepository.findOne({ where: { id } });

    if (!subAdmin) {
      throw new NotFoundException('Sub-admin not found');
    }

    await this.subAdminRepository.delete(id);
    return { message: 'Sub-admin deleted successfully' };
  }

  public async requestPasswordReset(email: string) {
    return this.resetPasswordReset.requestPasswordReset(email);
  }

  public async resetPassword(resetPasswordDto: ResetPasswordDto) {
    return this.resetPasswordReset.resetPassword(resetPasswordDto);
  }
}
