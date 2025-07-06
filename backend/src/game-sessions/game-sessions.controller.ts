import { Body, Controller, Post, Req, UseGuards, Get, Query } from '@nestjs/common';
import { CreateSessionDto } from './dto/create-session.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-guard.guard';
import { Request } from 'express';
import { GameSessionsService } from './game-sessions.service';
import { User } from 'src/auth/entities/user.entity';

@Controller('sessions')
export class GameSessionsController {
  constructor(private readonly sessionService: GameSessionsService) {}

  /**
   * Create a game session for authenticated users
   * Updates leaderboard and user stats
   */
  @UseGuards(JwtAuthGuard)
  @Post()
  createAuth(@Body() dto: CreateSessionDto, @Req() req: Request) {
    const user = req.user as User;
    return this.sessionService.create(dto, user);
  }

  /**
   * Create a game session for guest users
   * Sessions are saved anonymously and excluded from leaderboard/stats
   * 
   * @param dto - Session data including optional guestId in metadata
   * @returns Created session without user association
   */
  @Post('guest')
  createGuest(@Body() dto: CreateSessionDto) {
    return this.sessionService.create(dto, null);
  }

  /**
   * Get user sessions (authenticated users only)
   */
  @UseGuards(JwtAuthGuard)
  @Get('my-sessions')
  getMySessions(@Req() req: Request) {
    const user = req.user as User;
    return this.sessionService.getUserSessions(user);
  }

  /**
   * Get guest sessions by guestId
   * No authentication required
   */
  @Get('guest-sessions')
  getGuestSessions(@Query('guestId') guestId: string) {
    return this.sessionService.getUserSessions(null, guestId);
  }
}
