import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AdminService } from './providers/admin.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { RolesGuard } from 'security/guards/rolesGuard/roles.guard';
import { JwtAuthGuard } from 'security/guards/jwt-auth.guard';
import { Auth } from 'src/auth/decorators/auth.decorator';

@ApiTags('Admin')
@ApiBearerAuth() // Enable Bearer Token authentication for all endpoints
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new admin' })
  @ApiResponse({ status: 201, description: 'Admin created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiBody({ type: CreateAdminDto })
  async create(@Body() createAdminDto: CreateAdminDto) {
    return await this.adminService.createAdmin(createAdminDto);
  }

  @Auth(true) //testing the Auth decorator
  @Get()
  @ApiOperation({ summary: 'Get all admins' })
  @ApiResponse({ status: 200, description: 'List of all admins' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  findAll() {
    return this.adminService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an admin by ID' })
  @ApiResponse({ status: 200, description: 'Admin details' })
  @ApiResponse({ status: 404, description: 'Admin not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiParam({ name: 'id', description: 'The ID of the admin', example: 1 })
  findOne(@Param('id') id: string) {
    return this.adminService.findOne(+id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an admin by ID' })
  @ApiResponse({ status: 200, description: 'Admin updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 404, description: 'Admin not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiParam({ name: 'id', description: 'The ID of the admin', example: 1 })
  @ApiBody({ type: UpdateAdminDto })
  async update(
    @Param('id') id: string,
    @Body() updateAdminDto: UpdateAdminDto,
  ) {
    return this.adminService.update(+id, updateAdminDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an admin by ID' })
  @ApiResponse({ status: 200, description: 'Admin deleted successfully' })
  @ApiResponse({ status: 404, description: 'Admin not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiParam({ name: 'id', description: 'The ID of the admin', example: 1 })
  async remove(@Param('id') id: string) {
    return this.adminService.remove(+id);
  }
}
