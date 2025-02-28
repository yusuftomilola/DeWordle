import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Req,
  Param,
} from '@nestjs/common';
import { DictionaryService } from './dictionary.service';
import { SubmitWordDto } from './dto/submit-word.dto';
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';
import { JwtAuthGuard } from 'security/guards/jwt-auth.guard';
import { User } from '../users/entities/user.entity';

interface RequestWithUser extends Request {
  user: User;
}

@Controller('api/v1/dictionary')
export class DictionaryController {
  constructor(private readonly dictionaryService: DictionaryService) {}

  @Get('random')
  async getRandomWord() {
    return this.dictionaryService.getRandomWord();
  }

  @Post('submit')
  @UseGuards(JwtAuthGuard)
  async submitWord(@Body() dto: SubmitWordDto, @Req() req: RequestWithUser) {
    return this.dictionaryService.submitWord(dto, req.user);
  }

  @Get('validate/:word')
  async validateWord(@Param('word') word: string) {
    return this.dictionaryService.validateWord(word);
  }
}
