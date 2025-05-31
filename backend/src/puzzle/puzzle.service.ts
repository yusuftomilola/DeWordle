import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePuzzleDto } from './dto/create-puzzle.dto';
import { UpdatePuzzleDto } from './dto/update-puzzle.dto';
import { Puzzle } from './entities/puzzle.entity';


@Injectable()
export class PuzzleService {
  constructor(
    @InjectRepository(Puzzle)
    private readonly puzzleRepository: Repository<Puzzle>,
  ) {}

  /**
   * Create a new puzzle
   * @param createPuzzleDto - Puzzle data
   * @returns Created puzzle
   */
  async createPuzzle(createPuzzleDto: CreatePuzzleDto): Promise<Puzzle> {
    // Check if puzzle already exists for this date
    const existingPuzzle = await this.puzzleRepository.findOne({
      where: { date: createPuzzleDto.date }
    });

    if (existingPuzzle) {
      throw new ConflictException(`Puzzle already exists for date ${createPuzzleDto.date}`);
    }

    // Create new puzzle instance
    const puzzle = this.puzzleRepository.create(createPuzzleDto);

    // Validate grid dimensions
    if (!puzzle.validateGridDimensions()) {
      throw new BadRequestException('Grid must be 6x8 with single character strings');
    }

    // Validate spangram is in valid words
    if (!puzzle.validateSpangram()) {
      throw new BadRequestException('Spangram must be included in validWords array');
    }

    // Save and return
    return await this.puzzleRepository.save(puzzle);
  }

  /**
   * Get today's puzzle
   * @returns Today's puzzle or null if not found
   */
  async getTodaysPuzzle(): Promise<Puzzle | null> {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day
    
    return await this.puzzleRepository.findOne({
      where: { date: today }
    });
  }

  /**
   * Get puzzle by specific date
   * @param date - Target date
   * @returns Puzzle for the specified date
   */
  async getPuzzleByDate(date: Date): Promise<Puzzle> {
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0); // Reset time to start of day

    const puzzle = await this.puzzleRepository.findOne({
      where: { date: targetDate }
    });

    if (!puzzle) {
      throw new NotFoundException(`No puzzle found for date ${targetDate.toISOString().split('T')[0]}`);
    }

    return puzzle;
  }

  /**
   * Get puzzle by ID
   * @param id - Puzzle ID
   * @returns Puzzle with specified ID
   */
  async getPuzzleById(id: string): Promise<Puzzle> {
    const puzzle = await this.puzzleRepository.findOne({
      where: { id }
    });

    if (!puzzle) {
      throw new NotFoundException(`Puzzle with ID ${id} not found`);
    }

    return puzzle;
  }

  /**
   * Update existing puzzle
   * @param id - Puzzle ID
   * @param updatePuzzleDto - Updated puzzle data
   * @returns Updated puzzle
   */
  async updatePuzzle(id: string, updatePuzzleDto: UpdatePuzzleDto): Promise<Puzzle> {
    const puzzle = await this.getPuzzleById(id);

    // Update fields if provided
    if (updatePuzzleDto.theme) {
      puzzle.theme = updatePuzzleDto.theme;
    }
    
    if (updatePuzzleDto.grid) {
      puzzle.grid = updatePuzzleDto.grid;
      // Validate new grid dimensions
      if (!puzzle.validateGridDimensions()) {
        throw new BadRequestException('Grid must be 6x8 with single character strings');
      }
    }
    
    if (updatePuzzleDto.validWords) {
      puzzle.validWords = updatePuzzleDto.validWords;
    }
    
    if (updatePuzzleDto.spangram) {
      puzzle.spangram = updatePuzzleDto.spangram;
    }

    // Validate spangram is still in valid words after update
    if (!puzzle.validateSpangram()) {
      throw new BadRequestException('Spangram must be included in validWords array');
    }

    return await this.puzzleRepository.save(puzzle);
  }

  /**
   * Delete puzzle by ID (admin only)
   * @param id - Puzzle ID
   * @returns Deletion result
   */
  async deletePuzzle(id: string): Promise<{ deleted: boolean; message: string }> {
    const puzzle = await this.getPuzzleById(id);
    
    await this.puzzleRepository.remove(puzzle);
    
    return {
      deleted: true,
      message: `Puzzle for ${puzzle.date.toISOString().split('T')[0]} has been deleted`
    };
  }

  /**
   * Get all puzzles (admin functionality)
   * @param limit - Number of puzzles to return
   * @param offset - Number of puzzles to skip
   * @returns Array of puzzles
   */
  async getAllPuzzles(limit: number = 10, offset: number = 0): Promise<{ puzzles: Puzzle[]; total: number }> {
    const [puzzles, total] = await this.puzzleRepository.findAndCount({
      order: { date: 'DESC' },
      take: limit,
      skip: offset
    });

    return { puzzles, total };
  }

  /**
   * Validate puzzle solution
   * @param puzzleId - Puzzle ID
   * @param foundWords - Words found by player
   * @returns Validation result
   */
  async validateSolution(puzzleId: string, foundWords: string[]): Promise<{
    isComplete: boolean;
    validWords: string[];
    invalidWords: string[];
    missingWords: string[];
    foundSpangram: boolean;
  }> {
    const puzzle = await this.getPuzzleById(puzzleId);
    
    const validFoundWords = foundWords.filter(word => 
      puzzle.validWords.includes(word.toUpperCase())
    );
    
    const invalidWords = foundWords.filter(word => 
      !puzzle.validWords.includes(word.toUpperCase())
    );
    
    const missingWords = puzzle.validWords.filter(word => 
      !foundWords.map(w => w.toUpperCase()).includes(word)
    );
    
    const foundSpangram = foundWords.map(w => w.toUpperCase()).includes(puzzle.spangram.toUpperCase());
    
    const isComplete = missingWords.length === 0 && foundSpangram;

    return {
      isComplete,
      validWords: validFoundWords,
      invalidWords,
      missingWords,
      foundSpangram
    };
  }
}