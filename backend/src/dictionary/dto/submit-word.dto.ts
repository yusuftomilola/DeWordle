import {
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsOptional,
} from 'class-validator';

export class SubmitWordDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(45)
  word: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  definition?: string;
}
