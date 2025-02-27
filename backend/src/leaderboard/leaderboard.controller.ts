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
  UseGuards,
} from '@nestjs/common';
import { LeaderboardService } from './leaderboard.service';
import { CreateLeaderboardDto } from './dto/create-leaderboard.dto';
import { UpdateLeaderboardDto } from './dto/update-leaderboard.dto';
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
