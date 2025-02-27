import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { PrimaryColumn } from 'typeorm';
import { IsInt, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiProperty({
    description: 'The unique identifier of the user',
    example: 1,
    required: true,
  })
  @PrimaryColumn()
  @IsNotEmpty()
  @IsInt()
  id: number;
}
