import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { SubAdmin } from 'src/sub-admin/entities/sub-admin-entity';

@Injectable()
export class MailService {
  constructor(
    /*
     *inject mailerService
     */
    private readonly mailerServise: MailerService,
  ) {}

  public async welcomeEmail(subAdmin: SubAdmin): Promise<void> {
    await this.mailerServise.sendMail({
      to: subAdmin.email,
      from: `helpdesk <support@dewordle.come>`,
      subject: 'DeWordle sub-admin signUp',
      template: './welcome',
      context: {
        name: subAdmin.name,
        email: subAdmin.email,
        loginUrl: 'http://localhost:3000',
      },
    });
    console.log('Test Email Success');
  }
  //   public async welcomeEmail(subAdmin: SubAdmin): Promise<void> {
  //     await this.mailerServise.sendMail({
  //         to: subAdmin.email,
  //         from: `helpdesk <support@dewordle.come>`,
  //         subject: 'DeWordle sub-admin signUp',
  //         template: './welcome',
  //         context: {
  //             name: subAdmin.name,
  //             email: subAdmin.email,
  //             loginUrl: 'http://localhost:3000'
  //         }
  //     })
  //     console.log('Test Email Success')
  // }

  async sendVerificationEmail(email: string): Promise<void> {
    // Your implementation here (e.g., using nodemailer, etc.)
    console.log(`Sending verification email to ${email} with token }`);
  }

  async sendPasswordResetEmail(email: string, token: string) {
    const resetLink = `https://yourfrontend.com/reset-password?token=${token}`;

    await this.mailerServise.sendMail({
      to: email,
      subject: 'Password Reset Request',
      template: './password-reset', // e.g., a template file in the templates folder
      context: { resetLink }, // Data to inject into the template
    });
  }
}
