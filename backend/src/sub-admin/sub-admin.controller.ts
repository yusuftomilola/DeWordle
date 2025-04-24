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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
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

@ApiTags('SubAdmin')
@ApiBearerAuth() // Enable Bearer Token authentication for all endpoints
@Controller('sub-admin')
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
  @ApiOperation({ summary: 'Create a new sub-admin' })
  @ApiResponse({
    status: 201,
    description: 'Sub-admin created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden',
  })
  @ApiBody({ type: CreateSubAdminDto })
  async create(@Body() createSubAdminDto: CreateSubAdminDto) {
    return await this.subAdminService.create(createSubAdminDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all sub-admins' })
  @ApiResponse({
    status: 200,
    description: 'List of all sub-admins',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden',
  })
  async findAll() {
    return await this.subAdminService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a sub-admin by ID' })
  @ApiResponse({
    status: 200,
    description: 'Sub-admin details',
  })
  @ApiResponse({
    status: 404,
    description: 'Sub-admin not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden',
  })
  @ApiParam({ name: 'id', description: 'The ID of the sub-admin', example: 1 })
  async findOne(@Param('id') id: string) {
    return await this.subAdminService.findOneById(+id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a sub-admin by ID' })
  @ApiResponse({
    status: 200,
    description: 'Sub-admin updated successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: 404,
    description: 'Sub-admin not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden',
  })
  @ApiParam({ name: 'id', description: 'The ID of the sub-admin', example: 1 })
  @ApiBody({ type: UpdateSubAdminDto })
  async update(
    @Param('id') id: string,
    @Body() updateAdminDto: UpdateSubAdminDto,
  ) {
    return this.subAdminService.update(+id, updateAdminDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a sub-admin by ID' })
  @ApiResponse({
    status: 200,
    description: 'Sub-admin deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Sub-admin not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden',
  })
  @ApiParam({ name: 'id', description: 'The ID of the sub-admin', example: 1 })
  async remove(@Param('id') id: string) {
    return await this.subAdminService.remove(+id);
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Request a password reset for a sub-admin' })
  @ApiResponse({
    status: 200,
    description:
      'If an account exists with this email, a reset link has been sent',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  @ApiBody({ type: ForgotPasswordDto })
  @UseFilters(ValidationExceptionFilter) // Applies only to this method
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    await this.subAdminService.requestPasswordReset(forgotPasswordDto.email);
    return {
      message:
        'If an account exists with this email, a reset link has been sent.',
    };
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Reset the password for a sub-admin' })
  @ApiResponse({
    status: 200,
    description:
      'Password reset successful. You can now log in with your new password',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: 404,
    description: 'Invalid or expired token',
  })
  @ApiBody({ type: ResetPasswordDto })
  @UseFilters(ValidationExceptionFilter)
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    await this.subAdminService.resetPassword(resetPasswordDto);
    return {
      message:
        'Password reset successful. You can now log in with your new password.',
    };
  }
}
