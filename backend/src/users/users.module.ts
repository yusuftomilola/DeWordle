import { forwardRef, Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { CreateUsersProvider } from './providers/create-users-provider';
import { AuthModule } from 'src/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { FindOneByEmailProvider } from './providers/find-one-by-email.provider';
import { LeaderboardModule } from 'src/leaderboard/leaderboard.module';
import { ResultService } from 'src/result/result.service';
import { ResultModule } from 'src/result/result.module';
import { FindOneByGoogleIdProvider } from './providers/find-one-by-google-id-provider';
import { CreateGoogleUserProvider } from './providers/create-google-user-provider';

@Module({
  imports: [
    forwardRef(() => AuthModule),
    forwardRef(() => LeaderboardModule),
    TypeOrmModule.forFeature([User]),
    LeaderboardModule,
    ResultModule,
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    CreateUsersProvider,
    FindOneByEmailProvider,
    ResultService,
    FindOneByGoogleIdProvider,
    CreateGoogleUserProvider,
  ],
  exports: [UsersService, ResultService],
})
export class UsersModule {}
