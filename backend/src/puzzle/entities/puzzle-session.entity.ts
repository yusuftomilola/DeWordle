import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class PuzzleSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  puzzleId: string;

  @Column('text', { array: true, default: [] })
  foundWords: string[];

  @Column('text', { array: true, default: [] })
  nonThemeWords: string[];

  @Column({ default: 0 })
  earnedHints: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}