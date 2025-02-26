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
                loginUrl: 'http://localhost:3000'
            }
        })
        console.log('Test Email Success')
    }
}