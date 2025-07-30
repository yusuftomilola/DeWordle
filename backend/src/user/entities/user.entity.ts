import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export class UserStats {
  @Column('int', { default: 0 })
  totalPuzzlesCompleted: number;

  @Column('int', { default: 0 })
  totalHintsUsed: number;

  @Column('int', { default: 0 })
  totalSpangramsFound: number;

  @Column('int', { default: 0 })
  currentStreak: number;

  @Column('int', { default: 0 })
  longestStreak: number;

  @Column('date', { nullable: true })
  lastPlayedDate: Date | null;
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', { unique: true, nullable: false })
  userName: string;

  @Column('varchar', { unique: true, nullable: false })
  email: string;

  @Column('varchar', { nullable: false })
  password: string;

  @Column({ default: false })
  isVerified: boolean;

  // @OneToMany(() => Leaderboard, (leaderboard) => leaderboard.user, {
  //   cascade: true,
  //   onDelete: 'CASCADE',
  // })
  // leaderboards: Leaderboard[];

  // @OneToMany(() => Result, (result) => result.user, {
  //   cascade: true,
  //   onDelete: 'CASCADE',
  // })
  // results: Result[];

  @Column('varchar', { length: 225, nullable: true })
  googleId?: string;

  @Column({ nullable: true })
  lastActivityAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

  @Column(() => UserStats)
  userStats: UserStats;
}
