import {
  Body,
  Controller,
  Post,
  Req,
  UseGuards,
  Get,
  Query,
  Param,
} from '@nestjs/common';
import { CreateSessionDto } from './dto/create-session.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-guard.guard';
import { Request } from 'express';
import { GameSessionsService } from './game-sessions.service';
import { User } from '../auth/entities/user.entity';
import { GameSession } from './entities/game-session.entity';
import { CreateGuessDto } from './dto/create-guess.dto';
import { toGameSessionDto } from '../common/dto/response-mappers';

@Controller('sessions')
export class GameSessionsController {
  constructor(private readonly sessionService: GameSessionsService) {}

  /**
   * Create a game session for authenticated users
   * Updates leaderboard and user stats
   */
  @UseGuards(JwtAuthGuard)
  @Post()
  async createAuth(@Body() dto: CreateSessionDto, @Req() req: Request) {
    const user = req.user as User;
    return toGameSessionDto(await this.sessionService.create(dto, user));
  }

  /**
   * Create a game session for guest users
   * Sessions are saved anonymously and excluded from leaderboard/stats
   *
   * @param dto - Session data including optional guestId in metadata
   * @returns Created session without user association
   */
  @Post('guest')
  async createGuest(@Body() dto: CreateSessionDto) {
    return toGameSessionDto(await this.sessionService.create(dto, null));
  }

  /**
   * Get user sessions (authenticated users only)
   */
  @UseGuards(JwtAuthGuard)
  @Get('my-sessions')
  async getMySessions(@Req() req: Request) {
    const user = req.user as User;
    return (await this.sessionService.getUserSessions(user)).map(
      toGameSessionDto,
    );
  }

  /**
   * Get guest sessions by guestId
   * No authentication required
   */
  @Get('guest-sessions')
  async getGuestSessions(@Query('guestId') guestId: string) {
    return (await this.sessionService.getUserSessions(null, guestId)).map(
      toGameSessionDto,
    );
  }

  /**
   * Submit a guess to an existing session.
   *
   */
  @UseGuards(JwtAuthGuard)
  @Post(':id/guess')
  async submitGuess(
    @Param('id') sessionId: GameSession['id'],
    @Body() { guess }: CreateGuessDto,
    @Req() req: Request,
  ) {
    const user = req.user as User;

    return await this.sessionService.guess(sessionId, guess, user);
  }

  @Post(':id/guest-guess')
  async submitGuessAsGuest(
    @Param('id') sessionId: GameSession['id'],
    @Body() { guess }: CreateGuessDto,
    @Query('guestId') guestId: string,
  ) {
    return this.sessionService.guess(sessionId, guess, null, guestId);
  }
}
