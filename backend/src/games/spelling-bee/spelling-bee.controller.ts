import { 
  Controller, 
  Post, 
  Body, 
  Param, 
  Patch,
  HttpStatus,
  HttpException
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiParam, 
  ApiBody 
} from '@nestjs/swagger';
import { SpellingBeeStateService } from './spelling-bee-state.service';
import { Game } from '../entities/game.entity';
import { WordValidatorService } from 'src/games/spelling-bee/providers/word-validator-service.service';

class CreateSpellingBeeGameDto {
  userId: string;
  centerLetter: string;
  outerLetters: string[];
  validWords: string[];
  difficulty?: 'easy' | 'medium' | 'hard';
}

class SubmitWordDto {
  word: string;
}

@ApiTags('spelling-bee')
@Controller('games/spelling-bee')
export class SpellingBeeController {
    constructor(
      private readonly spellingBeeStateService: SpellingBeeStateService,
      private readonly wordValidatorService: WordValidatorService,
    ) {}
  
  @Post()
  @ApiOperation({ summary: 'Create a new Spelling Bee game' })
  @ApiResponse({ 
    status: HttpStatus.CREATED, 
    description: 'Spelling Bee game created successfully' 
  })
  @ApiBody({ type: CreateSpellingBeeGameDto })
  async createGame(@Body() createGameDto: CreateSpellingBeeGameDto): Promise<Game> {
    try {
      return await this.spellingBeeStateService.createSpellingBeeGame(
        createGameDto.userId,
        createGameDto.centerLetter,
        createGameDto.outerLetters,
        createGameDto.validWords,
        createGameDto.difficulty,
      );
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Patch(':id/submit-word')
  @ApiOperation({ summary: 'Submit a word in a Spelling Bee game' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Word submitted successfully' 
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: 'Invalid word or game state' 
  })
  @ApiParam({ name: 'id', description: 'Game ID' })
  @ApiBody({ type: SubmitWordDto })
  async submitWord(
    @Param('id') id: string,
    @Body() submitWordDto: SubmitWordDto,
  ): Promise<Game> {
    try {
      return await this.spellingBeeStateService.submitWord(id, submitWordDto.word);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Patch(':id/hint')
  @ApiOperation({ summary: 'Use a hint in a Spelling Bee game' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Hint used successfully' 
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: 'No hints available or invalid game state' 
  })
  @ApiParam({ name: 'id', description: 'Game ID' })
  async useHint(@Param('id') id: string): Promise<Game> {
    try {
      return await this.spellingBeeStateService.useHint(id);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('submit-word')
  validateWord(@Body() body: any) {
    const { word, puzzle } = body;
    return this.wordValidatorService.validateWord(word, puzzle);
  }

}