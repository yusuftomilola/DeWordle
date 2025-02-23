import { User } from 'src/users/entities/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Leaderboard {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.leaderboards)
  user: User;

  @Column('integer', { default: 0 })
  totalWins: number;

  @Column('integer', { default: 0 })
  totalAttempts: number;

  @Column('float', { default: 0 })
  averageScore: number;
}
