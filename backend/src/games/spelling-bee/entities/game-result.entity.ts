import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from './user.entity';
import { Puzzle } from './puzzle.entity';

@Entity()
export class GameResult {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.gameResults, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Puzzle, (puzzle) => puzzle.gameResults, { onDelete: 'CASCADE' })
  puzzle: Puzzle;

  @Column()
  score: number;

  @Column('simple-array')
  wordsFound: string[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}