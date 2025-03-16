import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  constructor(
    private mailerService: MailerService,
    private configService: ConfigService,
  ) {}

  async sendVerificationEmail(email: string, token: string) {
    const frontendUrl = this.configService.get('FRONTEND_URL');
    const verificationLink = `${frontendUrl}/verify-email/${token}`;

    await this.mailerService.sendMail({
      to: email,
      subject: 'Email Verification',
      template: './verification',
      context: {
        verificationLink,
        appName: this.configService.get('APP_NAME', 'Our Application'),
      },
    });
  }

  async sendPasswordResetEmail(email: string, token: string) {
    const frontendUrl = this.configService.get('FRONTEND_URL');
    const resetLink = `${frontendUrl}/reset-password/${token}`;

    await this.mailerService.sendMail({
      to: email,
      subject: 'Password Reset Request',
      template: './password-reset',
      context: {
        resetLink,
        appName: this.configService.get('APP_NAME', 'Our Application'),
        expiryTime: '1 hour',
      },
    });
  }
}
