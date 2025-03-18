import { IsEmail, IsNotEmpty } from 'class-validator';

export class EmailDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty()
  email: string;
}
