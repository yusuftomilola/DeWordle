import { IsEnum, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString, IsUUID, Min } from "class-validator"
import { ItemType, ItemRarity } from "../entities/item.entity"
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"

export class AddItemDto {
  @ApiProperty({ description: "The ID of the user who owns the inventory" })
  @IsNotEmpty()
  @IsString()
  userId: string

  @ApiPropertyOptional({ description: "The ID of an existing item to add to inventory" })
  @IsOptional()
  @IsUUID()
  itemId?: string

  @ApiPropertyOptional({ description: "Name of the item (required when creating a new item)" })
  @IsOptional()
  @IsString()
  name?: string

  @ApiPropertyOptional({ description: "Description of the item" })
  @IsOptional()
  @IsString()
  description?: string

  @ApiPropertyOptional({
    description: "Type of the item",
    enum: ItemType,
    example: ItemType.POWER_UP,
  })
  @IsOptional()
  @IsEnum(ItemType)
  type?: ItemType

  @ApiPropertyOptional({
    description: "Rarity of the item",
    enum: ItemRarity,
    example: ItemRarity.COMMON,
  })
  @IsOptional()
  @IsEnum(ItemRarity)
  rarity?: ItemRarity

  @ApiPropertyOptional({
    description: "Quantity of the item to add",
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  quantity?: number

  @ApiPropertyOptional({
    description: "Item attributes as a JSON object",
    example: { damage: 50, durability: 100 },
  })
  @IsOptional()
  @IsObject()
  attributes?: Record<string, any>

  @ApiPropertyOptional({
    description: "Additional metadata for the inventory entry",
    example: { source: "quest-reward", expiresAt: "2023-12-31" },
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>

  @ApiPropertyOptional({ description: "Base value of the item" })
  @IsOptional()
  @IsNumber()
  @Min(0)
  baseValue?: number

  @ApiPropertyOptional({ description: "Required player level to use the item" })
  @IsOptional()
  @IsNumber()
  @Min(1)
  requiredLevel?: number

  @ApiPropertyOptional({
    description: "Crafting requirements as a JSON object",
    example: { wood: 2, iron: 1 },
  })
  @IsOptional()
  @IsObject()
  craftingRequirements?: Record<string, number>

  @ApiPropertyOptional({
    description: "Usage effects as a JSON object",
    example: { health: 50, mana: 25 },
  })
  @IsOptional()
  @IsObject()
  usageEffects?: Record<string, any>

  @ApiPropertyOptional({ description: "Whether the item is a seasonal or limited-time item" })
  @IsOptional()
  @IsString()
  isSeasonalItem?: boolean

  @ApiPropertyOptional({
    description: "IDs of other items that form a set with this item",
    example: ["item-uuid-1", "item-uuid-2"],
  })
  @IsOptional()
  @IsString({ each: true })
  setItems?: string[]
}

