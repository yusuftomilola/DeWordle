import { IsEmail, IsNotEmpty } from 'class-validator';

export class UnlockAccountDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
