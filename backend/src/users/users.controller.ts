import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ClassSerializerInterceptor,
  UseInterceptors,
  Query,
  ParseIntPipe,
  NotFoundException,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RolesGuard } from 'security/guards/rolesGuard/roles.guard';
import { UserRole } from 'src/common/enums/users-roles.enum';
import { RoleDecorator } from 'security/decorators/roles.decorator';
import { JwtAuthGuard } from 'security/guards/jwt-auth.guard';

@Controller('/api/v1/users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UseInterceptors(ClassSerializerInterceptor)
  @UseGuards(RolesGuard)
  @RoleDecorator(UserRole.User, UserRole.Admin)
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  // GET /users?limit=10&page=1
  @Get()
  @UseGuards(RolesGuard)
  @RoleDecorator(UserRole.Admin, UserRole.SubAdmin)
  async findAll(
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('limit', ParseIntPipe) limit: number = 10,
  ) {
    return this.usersService.findAll(page, limit);
  }

  // DELETE /users/:id
  @Delete(':id')
  @UseGuards(RolesGuard)
  @RoleDecorator(UserRole.User, UserRole.Admin, UserRole.SubAdmin)
  async softDelete(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.softDelete(id);
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @RoleDecorator(UserRole.Admin, UserRole.SubAdmin)
  findOne(@Param('id') id: string) {
    return this.usersService.findOneById(+id);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @RoleDecorator(UserRole.Admin, UserRole.SubAdmin)
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }

  /**Patch endpoint */
  @Patch(':id')
  @UseGuards(RolesGuard)
  @RoleDecorator(UserRole.Admin, UserRole.SubAdmin, UserRole.User)
  public async updateUser(
    @Body() updateUserDto: UpdateUserDto,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const user = await this.usersService.updateUser(id, updateUserDto);

    /**if user does not exist */
    if (!user) {
      throw new NotFoundException('No user was found');
    }
    return user;
  }
}
