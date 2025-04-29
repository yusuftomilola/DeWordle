import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { GameResult } from './game-result.entity';

@Entity()
export class Puzzle {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  letters: string;

  @Column()
  centerLetter: string;

  @Column()
  date: Date;

  @OneToMany(() => GameResult, (gameResult) => gameResult.puzzle)
  gameResults: GameResult[];
}