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

  DefaultValuePipe,
  Query,

  UseGuards,

} from '@nestjs/common';
import { LeaderboardService } from './leaderboard.service';
import { CreateLeaderboardDto } from './dto/create-leaderboard.dto';
import { UpdateLeaderboardDto } from './dto/update-leaderboard.dto';

import { query } from 'express';

import { JwtAuthGuard } from 'security/guards/jwt-auth.guard';
import { RolesGuard } from 'security/guards/rolesGuard/roles.guard';
import { RoleDecorator } from 'security/decorators/roles.decorator';
import { UserRole } from 'src/common/enums/users-roles.enum';



@Controller('leaderboard')
@UseGuards(JwtAuthGuard)
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  @Post()
  @UseGuards(RolesGuard)
  @RoleDecorator(UserRole.Admin)
  async createleadboard(@Body() createLeaderboardDto: CreateLeaderboardDto) {
    return await this.leaderboardService.createLeaderboard(
      createLeaderboardDto,
    );
  }


  @Get('/leaderboard/:id')
  async findOneLeaderboardBy(id: number) {
    return this.leaderboardService.getOneLeaderboardBy(id);
  }
  @Delete('/leaderboard/:id')
  async deleteLeaderboard(@Query('id', ParseIntPipe) id: number) {
    return this.leaderboardService.deleteLeaderboard(id);
  }

  @Get('/leaderboard')
  async findAllLeaderboard(
    @Param() createLeaderboardDto: CreateLeaderboardDto,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
  ) {
    return this.leaderboardService.getAllLeaderboard(
      createLeaderboardDto,
      limit,
      page,
    );

  @Get()
  @UseGuards(RolesGuard)
  @RoleDecorator(UserRole.Admin, UserRole.SubAdmin, UserRole.User)
  findAll() {
    return this.leaderboardService.findAll();
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @RoleDecorator(UserRole.Admin, UserRole.SubAdmin)
  findOne(@Param('id') id: string) {
    return this.leaderboardService.findOne(+id);

  }

  @Patch(':id')
  @HttpCode(200)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateLeaderboardDto,
  ) {
    return this.leaderboardService.update(id, updateDto);
  }


  @Delete(':id')
  @UseGuards(RolesGuard)
  @RoleDecorator(UserRole.Admin)
  remove(@Param('id') id: string) {
    return this.leaderboardService.remove(+id);
  }

}
