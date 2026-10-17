import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

export type DigestDeliveryStatus = 'sent' | 'failed';

/** One row per (user, week): proves delivery and prevents duplicate sends. */
@Entity('digest_deliveries')
@Unique('UQ_digest_deliveries_user_week', ['userId', 'weekStart'])
export class DigestDelivery {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'int' })
  userId: number;

  /** Monday (UTC) of the digest's reporting week, `YYYY-MM-DD`. */
  @Column({ type: 'date' })
  weekStart: string;

  @Column({ type: 'varchar', length: 16 })
  status: DigestDeliveryStatus;

  @Column({ type: 'text', nullable: true })
  error: string | null;

  @CreateDateColumn()
  createdAt: Date;
}
