import {
  IsArray,
  IsNotEmpty,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePuzzleDto {
  @ApiProperty({
    example: 'Updated Animals Theme',
    description: 'Updated theme',
    required: false,
  })
  @IsString()
  @IsNotEmpty()
  theme?: string;

  @ApiProperty({ description: 'Updated 6x8 grid of letters', required: false })
  @IsArray()
  @ValidateNested({ each: true })
  grid?: string[][];

  @ApiProperty({ description: 'Updated list of valid words', required: false })
  @IsArray()
  @IsString({ each: true })
  validWords?: string[];

  @ApiProperty({
    example: 'NEWSPANGRAM',
    description: 'Updated spangram',
    required: false,
  })
  @IsString()
  @IsNotEmpty()
  spangram?: string;
}
