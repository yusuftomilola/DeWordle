import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class ValidateWordDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  word: string;
}
