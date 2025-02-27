import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';

@Entity()
export class RetentionMetric {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index()
  date: Date;

  @Column()
  @Index()
  period: 'daily' | 'weekly' | 'monthly';

  @Column('int')
  totalUsers: number;

  @Column('int')
  activeUsers: number;

  @Column('float')
  retentionRate: number;

  @Column('float')
  churnRate: number;

  @Column('int')
  newUsers: number;

  @Column('int')
  returningUsers: number;

  @Column('jsonb', { nullable: true })
  cohortData: {
    cohortDate: string;
    userCount: number;
    retentionByWeek: number[];
  }[];

  @CreateDateColumn()
  createdAt: Date;
}