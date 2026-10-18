import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../auth/entities/user.entity';
import { EmailService } from '../auth/email.service';
import { GameSession } from '../game-sessions/entities/game-session.entity';
import { DigestController } from './digest.controller';
import { DigestDelivery } from './digest-delivery.entity';
import { DigestService } from './digest.service';
import { DigestTemplate } from './digest-template.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, GameSession, DigestTemplate, DigestDelivery]),
  ],
  controllers: [DigestController],
  providers: [DigestService, EmailService],
  exports: [DigestService],
})
export class DigestModule {}
