import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.ethereal.email',
      port: Number(process.env.SMTP_PORT) || 587,
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
      },
    });
  }

  /** Resolves true when the message was accepted, false if sending failed. */
  async sendMail(to: string, subject: string, html: string): Promise<boolean> {
    try {
      const info = await this.transporter.sendMail({
        from: process.env.SMTP_FROM || 'no-reply@dewordle.com',
        to,
        subject,
        html,
      });
      this.logger.log(`Email sent: ${info.messageId}`);
      if (nodemailer.getTestMessageUrl(info)) {
        this.logger.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
      }
      return true;
    } catch (error) {
      this.logger.error('Failed to send email', error.stack);
      return false;
    }
  }
}
