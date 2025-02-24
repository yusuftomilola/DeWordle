import { IsArray, IsInt, IsNumber, IsOptional } from 'class-validator';
import { Result } from 'src/result/entities/result.entity';
export class CreateLeaderboardDto {
  @IsInt()
  @IsOptional()
  readonly id?: number;

  @IsInt()
  readonly userId: number;

  @IsInt()
  readonly totalWins: number;

  @IsInt()
  readonly totalAttempts: number;

  @IsNumber()
  readonly averageScore: number;

  @IsArray()
  readonly results: Result[];
}
