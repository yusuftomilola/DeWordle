import { Type } from 'class-transformer';
import {
  IsEmail,
  IsString,
  MinLength,
  Matches,
  MaxLength,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Result } from 'src/result/entities/result.entity';

export class CreateUserDto {
  @IsString()
  @MinLength(3)
  userName: string;

  @IsEmail()
  email: string;

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

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Result)
  results: Result[];
}
