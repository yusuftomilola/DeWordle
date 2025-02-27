import {
  IsString,
  IsNumber,
  IsOptional,
  IsNotEmpty,
  Min,
  Max,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateStatusResultDto {
  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  timesPlayed: number = 0;

  @IsOptional()
  @IsNumber()
  @Min(0)
  currentStreak: number = 0;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxStreak: number = 0;

  @IsOptional()
  @IsNumber()
  @Min(0.0)
  @Max(100.0)
  winPercentage: number = 0.0;
}

export class UpdateStatusResultDto extends PartialType(CreateStatusResultDto) {}
