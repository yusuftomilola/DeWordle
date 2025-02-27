import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Res,
  Delete,
  ParseIntPipe,
  HttpCode,
  UseGuards,
} from '@nestjs/common';
import { Response as ResType } from 'express';
import { ResultService } from './result.service';
import { CreateResultDto } from './dto/create-result.dto';
import { UpdateResultDto } from './dto/update-result.dto';
import {
  CreateStatusResultDto,
  UpdateStatusResultDto,
} from './dto/status-result.dto';
import { JwtAuthGuard } from 'security/guards/jwt-auth.guard';
import { RolesGuard } from 'security/guards/rolesGuard/roles.guard';
import { RoleDecorator } from 'security/decorators/roles.decorator';
import { UserRole } from 'src/common/enums/users-roles.enum';

@Controller('result')
@UseGuards(JwtAuthGuard)
export class ResultController {
  constructor(private readonly resultService: ResultService) {}

  @Post()
  create(@Body() createResultDto: CreateResultDto) {
    return this.resultService.create(createResultDto);
  }

  @Get()
  findAll() {
    return this.resultService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.resultService.findOne(+id);
  }

  @Patch(':userId')
  @UseGuards(RolesGuard)
  @RoleDecorator(UserRole.Admin, UserRole.SubAdmin)
  updateResult(
    @Param('userId') userId: string,
    @Body() updateResultDto: UpdateResultDto,
  ) {
    return this.resultService.updateResult(userId, updateResultDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @RoleDecorator(UserRole.Admin)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.resultService.remove(id);
  }
}

@Controller('results')
export class StatusResultController {
  constructor(private readonly resultService: ResultService) {}

  @Get()
  async findAll(@Res() res: ResType): Promise<void> {
    await this.resultService.findAllResults(res);
  }

  @Get(':userId')
  async findOne(
    @Param('userId') userId: string,
    @Res() res: ResType,
  ): Promise<void> {
    await this.resultService.findOneResults(userId, res);
  }

  @Patch(':userId')
  async update(
    @Param('userId') userId: string,
    @Body() updateResultDto: UpdateStatusResultDto,
    @Res() res: ResType,
  ): Promise<void> {
    await this.resultService.updateResults(userId, updateResultDto, res);
  }

  @Delete(':userId')
  @HttpCode(204)
  async remove(
    @Param('userId') userId: string,
    @Res() res: ResType,
  ): Promise<void> {
    await this.resultService.removeResults(userId, res);
  }
}
