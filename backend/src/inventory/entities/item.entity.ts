import { Column, Entity, PrimaryGeneratedColumn } from "typeorm"

export enum ItemType {
  POWER_UP = "power-up",
  NFT = "nft",
  BOOSTER = "booster",
  COLLECTIBLE = "collectible",
  WEAPON = "weapon",
  ARMOR = "armor",
  CONSUMABLE = "consumable",
}

export enum ItemRarity {
  COMMON = "common",
  UNCOMMON = "uncommon",
  RARE = "rare",
  EPIC = "epic",
  LEGENDARY = "legendary",
}

@Entity("items")
export class Item {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column()
  name: string

  @Column()
  description: string

  @Column({
    type: "enum",
    enum: ItemType,
    default: ItemType.COLLECTIBLE,
  })
  type: ItemType

  @Column({
    type: "enum",
    enum: ItemRarity,
    default: ItemRarity.COMMON,
  })
  rarity: ItemRarity

  @Column({ nullable: true })
  imageUrl: string

  @Column({ type: "jsonb", nullable: true })
  attributes: Record<string, any>

  @Column({ default: 1 })
  baseValue: number

  @Column({ default: 1 })
  requiredLevel: number

  @Column({ default: 100 })
  maxDurability: number

  @Column({ type: "jsonb", nullable: true })
  craftingRequirements: Record<string, number>

  @Column({ type: "jsonb", nullable: true })
  usageEffects: Record<string, any>

  @Column({ default: false })
  isSeasonalItem: boolean

  @Column({ type: "simple-array", nullable: true })
  setItems: string[]

  @Column({ default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date

  @Column({ default: () => "CURRENT_TIMESTAMP" })
  updatedAt: Date
}

