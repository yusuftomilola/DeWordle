import { IsNotEmpty, IsString, IsOptional, IsNumber, IsObject, Min } from "class-validator"

export class CreateContributionDto {
  @IsNotEmpty()
  @IsString()
  userId: string

  @IsNotEmpty()
  @IsString()
  type: string

  @IsOptional()
  @IsNumber()
  @Min(0)
  points?: number

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>
}

