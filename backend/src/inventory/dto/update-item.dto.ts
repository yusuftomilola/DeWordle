import { IsBoolean, IsNumber, IsObject, IsOptional, IsUUID, Min } from "class-validator"
import { ApiPropertyOptional } from "@nestjs/swagger"

export class UpdateInventoryItemDto {
  @ApiPropertyOptional({ description: "The ID of the inventory entry to update" })
  @IsUUID()
  inventoryId: string

  @ApiPropertyOptional({
    description: "New quantity of the item",
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  quantity?: number

  @ApiPropertyOptional({
    description: "Whether the item is equipped by the player",
  })
  @IsOptional()
  @IsBoolean()
  isEquipped?: boolean

  @ApiPropertyOptional({
    description: "Updated metadata for the inventory entry",
    example: { lastUsed: "2023-06-15", durability: 85 },
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>
}

