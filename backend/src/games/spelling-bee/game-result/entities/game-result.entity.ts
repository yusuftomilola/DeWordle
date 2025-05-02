import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from '../../user/entities/user.entity'; // Updated import path
import { Puzzle } from '../../puzzle/entities/puzzle.entity'; // Updated import path

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