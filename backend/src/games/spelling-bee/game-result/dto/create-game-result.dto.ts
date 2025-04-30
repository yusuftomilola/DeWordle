import { IsInt, IsArray, IsString, Min, ArrayNotEmpty, ArrayMinSize } from 'class-validator';

export class CreateGameResultDto {
  @IsInt()
  userId: number;

  @IsInt()
  puzzleId: number;

  @IsInt()
  @Min(0)
  score: number;

  @IsArray()
  @ArrayNotEmpty()
  @ArrayMinSize(1)
  @IsString({ each: true })
  wordsFound: string[];
}