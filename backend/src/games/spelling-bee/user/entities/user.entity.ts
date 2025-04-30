import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { GameResult } from '../../game-result/entities/game-result.entity'; // Updated import path

@Entity() 
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @OneToMany(() => GameResult, (gameResult) => gameResult.user)
  gameResults: GameResult[];
}