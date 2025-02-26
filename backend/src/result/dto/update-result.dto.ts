import { IsBoolean, IsUUID } from 'class-validator';

export class UpdateResultDto {
  @IsUUID()
  userId: string;

  @IsBoolean()
  won: boolean;
}
