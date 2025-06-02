import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PuzzleSession } from '../entities/puzzle-session.entity';

export class ValidateWordDto {
  @IsString()
  @IsNotEmpty()
  word: string;
}


export class ValidateWordResponseDto {
  @ApiProperty()
  word: string;

  @ApiProperty({ enum: ['theme', 'spangram', 'non-theme', 'invalid'] })
  type: string;

  @ApiProperty()
  valid: boolean;

  @ApiProperty()
  earnedHints: number;

  @ApiProperty()
  updatedSession: PuzzleSession;
}