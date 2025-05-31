import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpStatus,
  UseGuards,
  ParseUUIDPipe,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { PuzzleService } from './puzzle.service';
import { CreatePuzzleDto } from './dto/create-puzzle.dto';
import { PuzzleResponseDto } from './dto/puzzle-response.dto';
import { UpdatePuzzleDto } from './dto/update-puzzle.dto';
import { Puzzle } from './entities/puzzle.entity';
import { AdminJwtAuthGuard } from 'src/admin/guards/admin-jwt-auth.guard';

@ApiTags('puzzles')
@Controller('puzzles')
export class PuzzleController {
  constructor(private readonly puzzleService: PuzzleService) {}

  @Get('today')
  @ApiOperation({ summary: "Get today's puzzle" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Today's puzzle retrieved successfully",
    type: PuzzleResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'No puzzle available for today',
  })
  async getTodaysPuzzle(): Promise<Puzzle | { message: string }> {
    const puzzle = await this.puzzleService.getTodaysPuzzle();

    if (!puzzle) {
      return { message: 'No puzzle available for today' };
    }

    return puzzle;
  }

  @Get(':date')
  @ApiOperation({ summary: 'Get puzzle by specific date' })
  @ApiParam({
    name: 'date',
    description: 'Date in YYYY-MM-DD format',
    example: '2024-01-15',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Puzzle retrieved successfully',
    type: PuzzleResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Puzzle not found for the specified date',
  })
  async getPuzzleByDate(@Param('date') date: string): Promise<Puzzle> {
    const parsedDate = new Date(date);
    return await this.puzzleService.getPuzzleByDate(parsedDate);
  }

  @Post()
  @ApiOperation({ summary: 'Create new puzzle (Admin only)' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Puzzle created successfully',
    type: PuzzleResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Puzzle already exists for this date',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid puzzle data',
  })

  @UseGuards(AdminJwtAuthGuard) 
  @ApiBearerAuth()
  async createPuzzle(
    @Body() createPuzzleDto: CreatePuzzleDto,
  ): Promise<Puzzle> {
    return await this.puzzleService.createPuzzle(createPuzzleDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update existing puzzle (Admin only)' })
  @ApiParam({ name: 'id', description: 'Puzzle UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Puzzle updated successfully',
    type: PuzzleResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Puzzle not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid update data',
  })

  @UseGuards(AdminJwtAuthGuard) 
  @ApiBearerAuth()
  async updatePuzzle(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePuzzleDto: UpdatePuzzleDto,
  ): Promise<Puzzle> {
    return await this.puzzleService.updatePuzzle(id, updatePuzzleDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete puzzle (Admin only)' })
  @ApiParam({ name: 'id', description: 'Puzzle UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Puzzle deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Puzzle not found',
  })

  @UseGuards(AdminJwtAuthGuard) 
  @ApiBearerAuth()
  async deletePuzzle(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ deleted: boolean; message: string }> {
    return await this.puzzleService.deletePuzzle(id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all puzzles with pagination (Admin only)' })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of puzzles to return',
    example: 10,
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    description: 'Number of puzzles to skip',
    example: 0,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Puzzles retrieved successfully',
  })

  @UseGuards(AdminJwtAuthGuard) 
  @ApiBearerAuth()
  async getAllPuzzles(
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
    @Query('offset', new ParseIntPipe({ optional: true })) offset: number = 0,
  ): Promise<{ puzzles: Puzzle[]; total: number }> {
    return await this.puzzleService.getAllPuzzles(limit, offset);
  }

  @Post(':id/validate')
  @ApiOperation({ summary: 'Validate puzzle solution' })
  @ApiParam({ name: 'id', description: 'Puzzle UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Solution validated successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Puzzle not found',
  })
  async validateSolution(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { foundWords: string[] },
  ): Promise<{
    isComplete: boolean;
    validWords: string[];
    invalidWords: string[];
    missingWords: string[];
    foundSpangram: boolean;
  }> {
    return await this.puzzleService.validateSolution(id, body.foundWords);
  }
}
