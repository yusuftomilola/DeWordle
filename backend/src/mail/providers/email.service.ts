import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendPasswordResetEmail(email: string, token: string) {
    const resetLink = `https://yourfrontend.com/reset-password?token=${token}`;

    await this.mailerService.sendMail({
      to: email,
      subject: 'Password Reset Request',
      template: './password-reset', // e.g., a template file in the templates folder
      context: { resetLink }, // Data to inject into the template
    });
  }
}
