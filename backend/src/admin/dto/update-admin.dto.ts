/* eslint-disable prettier/prettier */
import {
  IsString,
  IsEmail,
  IsOptional,
  IsIn,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PartialType } from '@nestjs/mapped-types';
import { CreateAdminDto } from './create-admin.dto';

export class UpdateAdminDto extends PartialType(CreateAdminDto) {
  @ApiProperty({
    example: 'updated_admin',
    description: 'The updated username of the admin (optional)',
    required: false,
  })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiProperty({
    example: 'updated_admin@example.com',
    description: 'The updated email address of the admin (optional)',
    required: false,
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({
    example: 'NewPassword123!',
    description:
      'The updated password of the admin. Must be at least 6 characters long (optional)',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password?: string;

  @ApiProperty({
    example: 'super_admin',
    description:
      "The updated role of the admin. Must be either 'admin' or 'super_admin' (optional)",
    required: false,
    enum: ['admin', 'super_admin'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['admin', 'super_admin'], {
    message: "Role must be either 'admin' or 'super_admin'",
  })
  role?: string;
}
