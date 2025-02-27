import {
  Injectable,
  Inject,
  forwardRef,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { SubAdmin } from '../entities/sub-admin-entity';
import { HashingProvider } from 'src/auth/providers/hashing-provider';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { EmailService } from 'src/mail/providers/email.service';

@Injectable()
export class ResetPsswordService {
  constructor(
    @InjectRepository(SubAdmin)
    private readonly subAdminRepo: Repository<SubAdmin>,

    /*
     * Inject hashing provider
     */
    @Inject(forwardRef(() => HashingProvider))
    private readonly hashingProvider: HashingProvider,

    /*
     * Inject hashing provider
     */
    private readonly emailService: EmailService,
  ) {}

  async requestPasswordReset(email: string): Promise<void> {
    const subAdmin = await this.subAdminRepo.findOne({ where: { email } });

    if (!subAdmin) {
      throw new NotFoundException('Sub-admin with this email does not exist');
    }

    // Generate a secure reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpires = new Date();
    resetTokenExpires.setHours(resetTokenExpires.getHours() + 1); // Token expires in 1 hour

    subAdmin.resetToken = resetToken;
    subAdmin.resetTokenExpires = resetTokenExpires;

    await this.subAdminRepo.save(subAdmin);

    // Send the reset token via email (Mock function, replace with actual email service)
    console.log(`Password reset token for ${email}: ${resetToken}`);
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<void> {
    const subAdmin = await this.subAdminRepo.findOne({
      where: { resetToken: resetPasswordDto.token },
    });

    if (
      !subAdmin ||
      !subAdmin.resetTokenExpires ||
      new Date() > subAdmin.resetTokenExpires
    ) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    // Hash new password
    const hashedPassword = await this.hashingProvider.hashPassword(
      resetPasswordDto.newPassword,
    );

    subAdmin.password = hashedPassword;
    subAdmin.resetToken = null;
    subAdmin.resetTokenExpires = null;

    await this.subAdminRepo.save(subAdmin);

    // Send the reset email
    await this.emailService.sendPasswordResetEmail(
      subAdmin.email,
      resetPasswordDto.token,
    );
  }
}
