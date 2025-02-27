import {
  Controller,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Get,
  Put,
  UseFilters,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../security/guards/jwt-auth.guard';
import { RolesGuard } from '../../security/guards/rolesGuard/roles.guard';
import { CreateSubAdminDto } from './dto/create-sub-admin.dto';
import { UpdateSubAdminDto } from './dto/update-sub-admin.dto';
import { SubAdminService } from './sub-admin.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import {
  AllExceptionsFilter,
  AuthExceptionFilter,
  DatabaseExceptionFilter,
  ValidationExceptionFilter,
} from 'src/common/filters';
import { RoleDecorator } from 'security/decorators/roles.decorator';
import { UserRole } from 'src/common/enums/users-roles.enum';

@Controller('/api/v1/sub-admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@RoleDecorator(UserRole.Admin)
@UseFilters(
  AllExceptionsFilter,
  AuthExceptionFilter,
  DatabaseExceptionFilter,
  ValidationExceptionFilter,
)
export class SubAdminController {
  constructor(private readonly subAdminService: SubAdminService) {}

  @Post()
  async create(@Body() createSubAdminDto: CreateSubAdminDto) {
    return await this.subAdminService.create(createSubAdminDto);
  }

  @Get()
  async findAll() {
    return await this.subAdminService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.subAdminService.findOneById(+id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateAdminDto: UpdateSubAdminDto,
  ) {
    return this.subAdminService.update(+id, updateAdminDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.subAdminService.remove(+id);
  }

  @Post('forgot-password')
  @UseFilters(ValidationExceptionFilter) // Applies only to this method
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    await this.subAdminService.requestPasswordReset(forgotPasswordDto.email);
    return {
      message:
        'If an account exists with this email, a reset link has been sent.',
    };
  }

  @Post('reset-password')
  @UseFilters(ValidationExceptionFilter)
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    await this.subAdminService.resetPassword(resetPasswordDto);
    return {
      message:
        'Password reset successful. You can now log in with your new password.',
    };
  }
}
