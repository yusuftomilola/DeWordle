import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { LeaderboardService } from './leaderboard.service';
import { CreateLeaderboardDto } from './dto/create-leaderboard.dto';
import { UpdateLeaderboardDto } from './dto/update-leaderboard.dto';

@ApiTags('Leaderboard') // Group all endpoints under the 'Leaderboard' tag
@Controller('leaderboard')
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new leaderboard entry' })
  @ApiResponse({
    status: 201,
    description: 'Leaderboard entry created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  @ApiBody({ type: CreateLeaderboardDto })
  async createleadboard(@Body() createLeaderboardDto: CreateLeaderboardDto) {
    return await this.leaderboardService.createLeaderboard(
      createLeaderboardDto,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all leaderboard entries' })
  @ApiResponse({
    status: 200,
    description: 'List of all leaderboard entries',
  })
  findAll() {
    return this.leaderboardService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a leaderboard entry by ID' })
  @ApiResponse({
    status: 200,
    description: 'Leaderboard entry details',
  })
  @ApiResponse({
    status: 404,
    description: 'Leaderboard entry not found',
  })
  @ApiParam({
    name: 'id',
    description: 'The ID of the leaderboard entry',
    example: 1,
  })
  findOne(@Param('id') id: string) {
    return this.leaderboardService.findOne(+id);
  }

  @Patch(':id')
  @HttpCode(200)
  @ApiOperation({ summary: 'Update a leaderboard entry by ID' })
  @ApiResponse({
    status: 200,
    description: 'Leaderboard entry updated successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: 404,
    description: 'Leaderboard entry not found',
  })
  @ApiParam({
    name: 'id',
    description: 'The ID of the leaderboard entry',
    example: 1,
  })
  @ApiBody({ type: UpdateLeaderboardDto })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateLeaderboardDto,
  ) {
    return this.leaderboardService.update(id, updateDto);
  }
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a leaderboard entry by ID' })
  @ApiResponse({
    status: 200,
    description: 'Leaderboard entry deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Leaderboard entry not found',
  })
  @ApiParam({
    name: 'id',
    description: 'The ID of the leaderboard entry',
    example: 1,
  })
  remove(@Param('id') id: string) {
    return this.leaderboardService.remove(+id);
  }
}
