import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Matches, MinLength } from 'class-validator';
export class CreateAdminDto {
  @ApiProperty({
    example: 'admin_user',
    description: 'The username of the admin',
    required: true,
  })
  @IsString()
  username: string;

  @ApiProperty({
    example: 'admin@example.com',
    description: 'The email address of the admin',
    required: true,
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'Password123!',
    description:
      'The password must be 8-16 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character.',
    required: true,
  })
  @IsString()
  @MinLength(8)
  @Matches(
    /^(?=.*[!@#$%^&])(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])[a-zA-Z0-9!@#$%^&*]{8,16}$/,
    {
      message:
        'Password must include at least one uppercase letter, one lowercase letter, one number, and one special character.',
    },
  )
  password: string;

  @ApiProperty({
    example: 'admin',
    description: 'The role of the admin (optional)',
    required: false,
  })
  @IsString()
  role?: string;
}
