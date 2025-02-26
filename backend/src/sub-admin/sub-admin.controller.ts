import {
  Controller,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Get,
  Put,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../security/guards/jwt-auth.guard';
import { RolesGuard } from '../../security/guards/rolesGuard/roles.guard';
import { CreateSubAdminDto } from './dto/create-sub-admin.dto';
import { UpdateSubAdminDto } from './dto/update-sub-admin.dto';
import { SubAdminService } from './sub-admin.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Controller('/api/v1/sub-admin')
@UseGuards(JwtAuthGuard, RolesGuard)
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
    // return await this.subAdminService.findOne(+id);
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
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    await this.subAdminService.requestPasswordReset(forgotPasswordDto.email);
    return { message: 'If an account exists with this email, a reset link has been sent.' };
  }

  @Post('reset-password')
async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
  await this.subAdminService.resetPassword(resetPasswordDto);
  return { message: 'Password reset successful. You can now log in with your new password.' };
}

}
