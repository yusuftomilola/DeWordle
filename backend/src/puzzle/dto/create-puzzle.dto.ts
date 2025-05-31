import {
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsString,
  ArrayMinSize,
  ValidateNested,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePuzzleDto {
  @ApiProperty({
    example: '2024-01-15',
    description: 'Date for the puzzle (YYYY-MM-DD)',
  })
  @IsDateString()
  @IsNotEmpty()
  @Transform(({ value }) => new Date(value))
  date: Date;

  @ApiProperty({
    example: 'Animals in the Wild',
    description: 'Theme or hint for the puzzle',
  })
  @IsString()
  @IsNotEmpty()
  theme: string;

  @ApiProperty({
    example: [
      ['T', 'I', 'G', 'E', 'R', 'S', 'H', 'A'],
      ['L', 'I', 'O', 'N', 'M', 'O', 'N', 'K'],
      ['E', 'L', 'E', 'P', 'H', 'A', 'N', 'T'],
      ['P', 'A', 'N', 'D', 'A', 'B', 'E', 'A'],
      ['R', 'H', 'I', 'N', 'O', 'C', 'E', 'R'],
      ['O', 'S', 'Z', 'E', 'B', 'R', 'A', 'S'],
    ],
    description: '6x8 grid of letters',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(6)
  grid: string[][];

  @ApiProperty({
    example: [
      'TIGER',
      'LION',
      'ELEPHANT',
      'PANDA',
      'RHINO',
      'ZEBRA',
      'MONKEY',
      'BEAR',
    ],
    description: 'List of all valid words in the puzzle',
  })
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  validWords: string[];

  @ApiProperty({
    example: 'ELEPHANT',
    description: 'The special connecting word (spangram)',
  })
  @IsString()
  @IsNotEmpty()
  spangram: string;
}
