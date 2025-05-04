import { IsString, IsDateString, Length } from 'class-validator';

export class CreatePuzzleDto {
  @IsString()
  @Length(1, 50)
  letters: string;

  @IsString()
  @Length(1, 1)
  centerLetter: string;

  @IsDateString()
  date: string;
}