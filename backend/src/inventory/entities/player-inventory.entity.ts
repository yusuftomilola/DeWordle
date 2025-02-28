import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm"
import { Item } from "./item.entity"

@Entity("player_inventory")
export class PlayerInventory {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column()
  userId: string

  @Column()
  itemId: string

  @ManyToOne(() => Item)
  @JoinColumn({ name: "itemId" })
  item: Item

  @Column({ default: 1 })
  quantity: number

  @Column({ default: false })
  isEquipped: boolean

  @Column({ type: "jsonb", nullable: true })
  metadata: Record<string, any>

  @Column({ default: 100 })
  durability: number

  @Column({ default: () => "CURRENT_TIMESTAMP" })
  acquiredAt: Date

  @Column({ default: () => "CURRENT_TIMESTAMP" })
  updatedAt: Date

  @Column({ nullable: true })
  expiresAt: Date
}

