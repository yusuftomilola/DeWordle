import { Injectable } from '@nestjs/common';
import { GamesService } from '../games.service';
import { CreateGameDto, UpdateGameStateDto } from '../dtos/game.dto';
import { Game } from '../entities/game.entity';

export interface SpellingBeeAdditionalState {
  centerLetter: string;
  outerLetters: string[];
  validWords: string[];
  foundWords: string[];
  possiblePoints: number;
  minWordLength: number;
  difficulty: 'easy' | 'medium' | 'hard';
  hints: {
    hintsRevealed: number;
    maxHints: number;
    revealedWords: string[];
  };
}

@Injectable()
export class SpellingBeeStateService {
  constructor(private readonly gamesService: GamesService) {}

  /**
   * Create a new Spelling Bee game
   */
  async createSpellingBeeGame(
    userId: string,
    centerLetter: string,
    outerLetters: string[],
    validWords: string[],
    difficulty: 'easy' | 'medium' | 'hard' = 'medium',
  ): Promise<Game> {
    // Validate letters
    if (!centerLetter || centerLetter.length !== 1) {
      throw new Error('Center letter must be a single character');
    }
    
    if (!outerLetters || outerLetters.length !== 6) {
      throw new Error('Must provide exactly 6 outer letters');
    }
    
    // Convert to lowercase
    centerLetter = centerLetter.toLowerCase();
    outerLetters = outerLetters.map(l => l.toLowerCase());
    validWords = validWords.map(w => w.toLowerCase());
    
    // Make sure all valid words contain the center letter
    validWords = validWords.filter(word => word.includes(centerLetter));
    
    // Calculate total possible points
    const possiblePoints = this.calculateTotalPossiblePoints(validWords);
    
    // Set up additional state specific to Spelling Bee
    const maxHints = this.getMaxHintsByDifficulty(difficulty);
    const minWordLength = 4; // Standard minimum word length
    
    const additionalState: SpellingBeeAdditionalState = {
      centerLetter,
      outerLetters,
      validWords,
      foundWords: [],
      possiblePoints,
      minWordLength,
      difficulty,
      hints: {
        hintsRevealed: 0,
        maxHints,
        revealedWords: [],
      },
    };

    const createGameDto: CreateGameDto = {
      userId,
      gameType: 'spelling-bee',
      category: 'word-game', // Standard category for spelling bee
      additionalState,
    };

    return this.gamesService.createGame(createGameDto);
  }

  /**
   * Submit a word guess
   */
  async submitWord(gameId: string, word: string): Promise<Game> {
    // Get the current game state
    const game = await this.gamesService.getGameById(gameId);
    
    if (game.status !== 'IN_PROGRESS') {
      throw new Error('Game is not in progress');
    }
    
    // Convert to lowercase
    word = word.toLowerCase();
    
    const additionalState = game.additionalState as SpellingBeeAdditionalState;
    
    // Check if word is already found
    if (additionalState.foundWords.includes(word)) {
      throw new Error('Word already found');
    }
    
    // Check if word is valid
    if (!additionalState.validWords.includes(word)) {
      throw new Error('Not a valid word');
    }
    
    // Check minimum word length
    if (word.length < additionalState.minWordLength) {
      throw new Error(`Word must be at least ${additionalState.minWordLength} letters long`);
    }
    
    // Check if word contains center letter
    if (!word.includes(additionalState.centerLetter)) {
      throw new Error('Word must contain the center letter');
    }
    
    // Update game state with new found word
    const newFoundWords = [...additionalState.foundWords, word];
    
    const newAdditionalState: SpellingBeeAdditionalState = {
      ...additionalState,
      foundWords: newFoundWords,
    };
    
    // Calculate current score
    const currentScore = this.calculateCurrentScore(newFoundWords);
    
    const updateDto: UpdateGameStateDto = {
      additionalState: newAdditionalState,
      score: currentScore,
    };
    
    // Check if all words are found
    if (newFoundWords.length === additionalState.validWords.length) {
      updateDto.status = 'WON';
    }
    
    // Update the game state
    return this.gamesService.updateGameState(gameId, updateDto);
  }

  /**
   * Use a hint to reveal a word
   */
  async useHint(gameId: string): Promise<Game> {
    // Get the current game state
    const game = await this.gamesService.getGameById(gameId);
    
    if (game.status !== 'IN_PROGRESS') {
      throw new Error('Game is not in progress');
    }
    
    const additionalState = game.additionalState as SpellingBeeAdditionalState;
    
    // Check if hints are available
    if (additionalState.hints.hintsRevealed >= additionalState.hints.maxHints) {
      throw new Error('No hints remaining');
    }
    
    // Find a word that hasn't been revealed or found yet
    const unrevealedWords = additionalState.validWords.filter(
      word => !additionalState.foundWords.includes(word) && 
              !additionalState.hints.revealedWords.includes(word)
    );
    
    if (unrevealedWords.length === 0) {
      throw new Error('No more words to reveal');
    }
    
    // Sort by length (shortest first) to make hints helpful but not too revealing
    unrevealedWords.sort((a, b) => a.length - b.length);
    
    // Select a word to reveal (pick the shortest unrevealed word)
    const wordToReveal = unrevealedWords[0];
    
    // Update the game state
    const newRevealedWords = [...additionalState.hints.revealedWords, wordToReveal];
    
    const newAdditionalState: SpellingBeeAdditionalState = {
      ...additionalState,
      hints: {
        ...additionalState.hints,
        hintsRevealed: additionalState.hints.hintsRevealed + 1,
        revealedWords: newRevealedWords,
      },
    };
    
    const updateDto: UpdateGameStateDto = {
      additionalState: newAdditionalState,
    };
    
    return this.gamesService.updateGameState(gameId, updateDto);
  }

  /**
   * Calculate the total possible points for all valid words
   */
  private calculateTotalPossiblePoints(validWords: string[]): number {
    return validWords.reduce((total, word) => total + this.getWordPoints(word), 0);
  }

  /**
   * Calculate the current score based on found words
   */
  private calculateCurrentScore(foundWords: string[]): number {
    return foundWords.reduce((total, word) => total + this.getWordPoints(word), 0);
  }

  /**
   * Calculate points for a single word
   */
  private getWordPoints(word: string): number {
    // Standard Spelling Bee rules:
    // - 1 point for 4-letter words
    // - Word length points for longer words
    // - Bonus for pangrams (words that use all letters)
    
    if (word.length < 4) return 0;
    if (word.length === 4) return 1;
    
    // Longer words score their length
    let points = word.length;
    
    // Bonus for pangrams (7 additional points)
    // Check if word contains all letters (center + outer)
    // This implementation is a bit simplified
    return points;
  }

  /**
   * Get max hints based on difficulty
   */
  private getMaxHintsByDifficulty(difficulty: 'easy' | 'medium' | 'hard'): number {
    switch (difficulty) {
      case 'easy':
        return 3;
      case 'medium':
        return 2;
      case 'hard':
        return 1;
      default:
        return 2;
    }
  }
}