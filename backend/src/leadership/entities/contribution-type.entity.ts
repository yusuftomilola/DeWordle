import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from "typeorm"

@Entity("contribution_leaderboard_contribution_types")
export class ContributionTypeEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ unique: true })
  name: string

  @Column({ type: "int", default: 1 })
  defaultPoints: number

  @Column({ nullable: true })
  description: string

  @Column({ nullable: true })
  icon: string

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date
}

