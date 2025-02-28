import { IsEnum, IsDateString, IsOptional } from 'class-validator';

export class RetentionQueryDto {
  @IsEnum(['daily', 'weekly', 'monthly'])
  period: 'daily' | 'weekly' | 'monthly';

  @IsDateString()
  startDate: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;
}