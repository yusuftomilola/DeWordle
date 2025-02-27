import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsArray,
  IsDate,
} from 'class-validator';
import { Status } from '../enums/status.enum';
export class CreateResultDto {
  @ApiProperty({
    description: 'The unique identifier of the result',
    example: 1,
  })
  @IsInt()
  readonly id: number;

  @ApiProperty({
    description: 'The ID of the user associated with the result',
    example: 123,
    required: true,
  })
  @IsInt()
  @IsNotEmpty()
  readonly userId: number;

  @ApiProperty({
    description: 'The word associated with the result',
    example: 'example',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  readonly word: string;

  @ApiProperty({
    description:
      'Feedback for the result (can be a string or an array of strings)',
    example: ['Great job!', 'Well done!'],
    required: false,
  })
  @IsArray()
  @IsOptional()
  readonly feedback: string[] | string;

  @ApiProperty({
    description: 'The number of attempts made',
    example: 3,
    required: true,
  })
  @IsInt()
  @IsNotEmpty()
  readonly attempts: number;

  @ApiProperty({
    description: 'The status of the result',
    enum: Status,
    example: Status.WON,
    required: true,
  })
  @IsEnum(Status)
  @IsNotEmpty()
  readonly status: Status;

  @ApiProperty({
    description: 'The date when the game was played (optional)',
    example: '2023-10-01T12:34:56.789Z',
    required: false,
  })
  @IsDate()
  @IsOptional()
  readonly gameDate: Date;
}
