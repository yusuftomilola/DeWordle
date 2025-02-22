import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { LeaderboardModule } from './leaderboard/leaderboard.module';
import { AdminModule } from './admin/admin.module';
import { ResultModule } from './result/result.module';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost', // Change to your PostgreSQL host
      port: 5432,
      username: 'yourusername', // Replace with your PostgreSQL username
      password: 'yourpassword', // Replace with your PostgreSQL password
      database: 'yourdatabase', // Replace with your database name
      entities: [__dirname + '/**/*.entity{.ts,.js}'], // Auto-detect entity files
      synchronize: true, // Set to false in production
    }),
    UsersModule,
    AuthModule,
    LeaderboardModule,
    AdminModule,
    ResultModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
