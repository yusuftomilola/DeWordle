import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import {
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsString,
  IsUUID,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';

@Entity('puzzles')
@Index(['date'], { unique: true }) // Ensure one puzzle per day
export class Puzzle {
  @PrimaryGeneratedColumn('uuid')
  @IsUUID()
  id: string;

  @Column({ type: 'date', unique: true })
  @IsDateString()
  @IsNotEmpty()
  date: Date;

  @Column({ type: 'varchar', length: 255 })
  @IsString()
  @IsNotEmpty()
  theme: string;

  @Column({ type: 'json' })
  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  grid: string[][];

  @Column({ type: 'json' })
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  validWords: string[];

  @Column({ type: 'varchar', length: 100 })
  @IsString()
  @IsNotEmpty()
  spangram: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Method to validate grid dimensions (6x8 as mentioned)
  validateGridDimensions(): boolean {
    if (!this.grid || !Array.isArray(this.grid)) {
      return false;
    }

    // Check if grid has 6 rows
    if (this.grid.length !== 6) {
      return false;
    }

    // Check if each row has 8 columns
    return this.grid.every(
      (row) =>
        Array.isArray(row) &&
        row.length === 8 &&
        row.every((cell) => typeof cell === 'string' && cell.length === 1),
    );
  }

  // Method to validate spangram exists in valid words
  validateSpangram(): boolean {
    return this.validWords.includes(this.spangram);
  }
}
