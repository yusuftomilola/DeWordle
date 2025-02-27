import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubAdmin } from './entities/sub-admin-entity';
import { SubAdminService } from './sub-admin.service';
import { SubAdminController } from './sub-admin.controller';
import { AuthModule } from 'src/auth/auth.module';
import { ResetPsswordService } from './providers/reset-pssword.service';
import { MailModule } from 'src/mail/mail.module';

@Module({
  imports: [
    MailModule,
    TypeOrmModule.forFeature([SubAdmin]),
    forwardRef(() => AuthModule),
  ],
  controllers: [SubAdminController],
  providers: [SubAdminService, ResetPsswordService],
  exports: [SubAdminService],
})
export class SubAdminModule {}
