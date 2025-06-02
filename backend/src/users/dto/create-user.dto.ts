import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEmail,
  IsString,
  MinLength,
  Matches,
  MaxLength,
  IsArray,
  ValidateNested,
  IsOptional,
} from 'class-validator';
import { Result } from 'src/games/dewordle/result/entities/result.entity';

export class CreateUserDto {
  @ApiProperty({
    description: 'The username of the user',
    example: 'john_doe',
    required: true,
    minLength: 3,
  })
  @IsString()
  @MinLength(3)
  userName: string;

  @ApiProperty({
    description: 'The email address of the user',
    example: 'john.doe@example.com',
    required: true,
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'The password of the user',
    example: 'Password123!',
    required: true,
    maxLength: 225,
    pattern:
      '^(?=.*[!@#$%^&])(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])[a-zA-Z0-9!@#$%^&*]{8,16}$',
  })
  @IsString()
  @MaxLength(225)
  @Matches(
    /^(?=.*[!@#$%^&])(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])[a-zA-Z0-9!@#$%^&*]{8,16}$/,
    {
      message:
        'Password must include at least one uppercase letter, one lowercase letter, one number, and one special character.',
    },
  )
  password: string;

  gameId: number;

  // @IsOptional()
  // @ApiProperty({
  //   description: 'An array of results associated with the user',
  //   type: [Result], // Specify the type as an array of Result entities
  //   example: [
  //     {
  //       id: 1,
  //       userId: { id: 123, name: 'John Doe', email: 'john.doe@example.com' },
  //       user: { id: 123, name: 'John Doe', email: 'john.doe@example.com' },
  //       word: 'example',
  //       feedback: 'Great job!',
  //       attempts: 3,
  //       status: 'SUCCESS',
  //       gameDate: '2023-10-01T12:34:56.789Z',
  //     },
  //   ],
  //   required: true,
  // })
  // @IsArray()
  // @ValidateNested({ each: true })
  // @Type(() => Result)
  // results?: Result[];
}
