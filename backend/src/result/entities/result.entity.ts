import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  Unique,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Status } from '../enums/status.enum';
import { User } from 'src/users/entities/user.entity';

@Entity()
export class Result {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.results)
  userId: User;

  @ManyToOne(() => User, (user) => user.result, {
    onDelete: 'CASCADE',
    eager: true,
  })
  user: User;

  @Column('varchar', { nullable: false })
  word: string;

  @Column('varchar')
  feedback: string | [];

  @Column('integer')
  attempts: number;

  @Column({ type: 'enum', enum: Status })
  status: Status;

  @CreateDateColumn()
  gameDate: Date;
}

@Entity()
export class statusResult {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', unique: true })
  userId: string;

  @Column({ type: 'int', default: 0 })
  timesPlayed: number;

  @Column({ type: 'int', default: 0 })
  currentStreak: number;

  @Column({ type: 'int', default: 0 })
  maxStreak: number;

  @Column({ type: 'float', default: 0 })
  winPercentage: number;
}
