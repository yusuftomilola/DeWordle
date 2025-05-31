import { ApiProperty } from '@nestjs/swagger';

export class PuzzleResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  date: Date;

  @ApiProperty()
  theme: string;

  @ApiProperty()
  grid: string[][];

  @ApiProperty()
  validWords: string[];

  @ApiProperty()
  spangram: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
