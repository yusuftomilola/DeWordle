import { Entity, Column, PrimaryGeneratedColumn, Index, CreateDateColumn } from "typeorm"

@Entity("contribution_leaderboard_user_achievements")
export class UserAchievementEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ name: "user_id" })
  @Index()
  userId: string

  @Column({ name: "achievement_id" })
  @Index()
  achievementId: string

  @Column({ name: "awarded_at", type: "timestamp" })
  awardedAt: Date

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date
}

