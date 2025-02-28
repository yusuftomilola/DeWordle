import { IsNumber, IsOptional, Min, Max } from "class-validator"
import { Type } from "class-transformer"

export class PaginationDto {
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Type(() => Number)
  page = 1

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit = 10
}

