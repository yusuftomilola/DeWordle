import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Follow } from './entities/follow.entity';
import { Activity } from './entities/activity.entity';
import { User } from 'src/users/entities/user.entity';
import { SocialController } from './socials.controllers';
import { FollowService } from './socials.service';
 // Assuming User entity is already defined

@Module({
  imports: [TypeOrmModule.forFeature([Follow, Activity, User])],
  controllers: [SocialController],
  providers: [FollowService],
  exports: [FollowService],
})
export class SocialModule {}