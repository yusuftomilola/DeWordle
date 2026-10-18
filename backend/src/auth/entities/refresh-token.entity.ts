import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  Index,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { User } from './user.entity';

@Entity('refresh_tokens')
export class RefreshToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Exclude()
  @Index()
  @Column()
  tokenHash: string;

  @Index()
  @Column()
  walletAddress: string;

  @Column()
  expiresAt: Date;

  @Column({ nullable: true })
  revokedAt: Date;

  /** Set when this token has been exchanged for a successor; reuse means replay. */
  @Column({ type: 'timestamp', nullable: true })
  usedAt: Date | null;

  /** All tokens descended from one login share a family. */
  @Index()
  @Column({ type: 'uuid' })
  familyId: string;

  /** Number of rotations since the family's first token (0 for the first). */
  @Column({ type: 'int', default: 0 })
  depth: number;

  @Column({ nullable: true })
  userAgent: string;

  @Column({ nullable: true })
  ipAddress: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @CreateDateColumn()
  createdAt: Date;
}
