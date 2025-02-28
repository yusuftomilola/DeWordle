import { Entity, Column, PrimaryGeneratedColumn, Index, CreateDateColumn, UpdateDateColumn } from "typeorm"

@Entity("contribution_leaderboard_contributions")
export class ContributionEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ name: "user_id" })
  @Index()
  userId: string

  @Column({ name: "contribution_type_id" })
  @Index()
  contributionTypeId: string

  @Column({ type: "int", default: 1 })
  points: number

  @Column({ type: "jsonb", default: {} })
  metadata: Record<string, any>

  @CreateDateColumn({ name: "created_at" })
  @Index()
  createdAt: Date

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date
}

