import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class UpdateDigestTemplateDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  subject: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20000)
  bodyHtml: string;
}
