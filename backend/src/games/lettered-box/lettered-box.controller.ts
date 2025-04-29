import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { LetteredBoxService } from './lettered-box.service';


import { SubmitSolutionDto } from './dto/submit-solution-dto';
import { JwtAuthGuard } from 'security/guards/jwt-auth.guard';

@Controller('lettered-box')
export class LetteredBoxController {
  constructor(private readonly letteredBoxService: LetteredBoxService) {}

  @UseGuards(JwtAuthGuard)
  @Post('submit')
  async submit(@Body() dto: SubmitSolutionDto, @Request() req): Promise<any> {
    const userId = req.user.id;
    return this.letteredBoxService.submitSolution(dto, userId);
  }

  @Get('leaderboard')
  async leaderboard() {
    return this.letteredBoxService.getLeaderboard();
  }
}
