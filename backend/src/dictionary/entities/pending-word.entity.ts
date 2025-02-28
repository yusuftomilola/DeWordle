import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('pending_words')
export class PendingWord {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  word: string;

  @Column({ nullable: true })
  definition: string;

  @Column({ default: 'pending' })
  status: 'pending' | 'approved' | 'rejected';

  @ManyToOne(() => User, { eager: true })
  submittedBy: User;

  @Column({ nullable: true })
  rejectionReason: string;

  @CreateDateColumn()
  submittedAt: Date;
}
