import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';
import { SubAdmin } from 'src/sub-admin/entities/sub-admin-entity';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly mailerService: MailerService) {}

  /**
   * Send a welcome email to a sub-admin.
   */
  public async welcomeEmail(subAdmin: SubAdmin): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to: subAdmin.email,
        from: `helpdesk <support@dewordle.com>`,
        subject: 'DeWordle Sub-Admin Signup',
        template: './welcome',
        context: {
          name: subAdmin.name,
          email: subAdmin.email,
          loginUrl: 'http://localhost:3000',
        },
      });
      this.logger.log(`Welcome email sent to ${subAdmin.email}`);
    } catch (error) {
      this.logger.error(
        `Failed to send welcome email to ${subAdmin.email}: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Send a verification email to a user.
   */
  async sendVerificationEmail(email: string, token: string): Promise<void> {
    try {
      const verificationLink = `https://yourfrontend.com/verify-email?token=${token}`;

      await this.mailerService.sendMail({
        to: email,
        from: `helpdesk <support@dewordle.com>`,
        subject: 'Email Verification',
        template: './email-verification', // Template file in the templates folder
        context: { verificationLink }, // Data to inject into the template
      });

      this.logger.log(`Verification email sent to ${email}`);
    } catch (error) {
      this.logger.error(
        `Failed to send verification email to ${email}: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Send a password reset email to a user.
   */
  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    try {
      const resetLink = `https://yourfrontend.com/reset-password?token=${token}`;

      await this.mailerService.sendMail({
        to: email,
        from: `helpdesk <support@dewordle.com>`,
        subject: 'Password Reset Request',
        template: './password-reset', // Template file in the templates folder
        context: { resetLink }, // Data to inject into the template
      });

      this.logger.log(`Password reset email sent to ${email}`);
    } catch (error) {
      this.logger.error(
        `Failed to send password reset email to ${email}: ${error.message}`,
      );
      throw error;
    }
  }
}