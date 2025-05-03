import { Injectable } from '@nestjs/common';
import { SpellingBeeStateService, SpellingBeeAdditionalState } from './spelling-bee-state.service';
import { GamesService } from '../games.service';

@Injectable()
export class SpellingBeeService {
  constructor(private readonly spellingBeeStateService: SpellingBeeStateService,
    private readonly gamesService: GamesService,
  ) {}

  /**
   * Helper to get letters formatted for display
   */
  getFormattedLetters(centerLetter: string, outerLetters: string[]): {
    center: string;
    outer: string[];
  } {
    return {
      center: centerLetter.toUpperCase(),
      outer: outerLetters.map(letter => letter.toUpperCase()),
    };
  }

  /**
   * Helper to get hints remaining
   */
  getRemainingHints(maxHints: number, hintsUsed: number): number {
    return Math.max(0, maxHints - hintsUsed);
  }

  /**
   * Helper to check if a word qualifies as a pangram
   * (using all available letters)
   */
  isPangram(word: string, centerLetter: string, outerLetters: string[]): boolean {
    const allLetters = [centerLetter, ...outerLetters];
    const uniqueLetters = [...new Set(allLetters)]; // Remove duplicates
    
    // Convert to lowercase for comparison
    word = word.toLowerCase();
    
    // Check if every unique letter is included in the word
    return uniqueLetters.every(letter => word.includes(letter));
  }

  /**
   * Helper to get word status for display purposes
   */
  getWordStatus(
    word: string, 
    foundWords: string[], 
    revealedWords: string[]
  ): 'found' | 'revealed' | 'hidden' {
    if (foundWords.includes(word)) return 'found';
    if (revealedWords.includes(word)) return 'revealed';
    return 'hidden';
  }

  /**
   * Helper to get progress metrics
   */
  getGameProgress(foundWords: string[], totalWords: number): {
    wordsFound: number;
    totalWords: number;
    progressPercentage: number;
  } {
    return {
      wordsFound: foundWords.length,
      totalWords: totalWords,
      progressPercentage: Math.round((foundWords.length / totalWords) * 100),
    };
  }

  /**
   * Helper to generate a game summary
   */
  async generateGameSummary(gameId: string): Promise<{
    centerLetter: string;
    outerLetters: string[];
    foundWords: string[];
    totalWords: number;
    hintsRemaining: number;
    revealedWords: string[];
    currentScore: number;
    possiblePoints: number;
    progressPercentage: number;
    status: string;
  }> {
    const game = await this.gamesService.getGameById(gameId);
    const additionalState = game.additionalState as SpellingBeeAdditionalState;
    
    const progress = this.getGameProgress(
      additionalState.foundWords, 
      additionalState.validWords.length
    );
    
    return {
      centerLetter: additionalState.centerLetter.toUpperCase(),
      outerLetters: additionalState.outerLetters.map(l => l.toUpperCase()),
      foundWords: additionalState.foundWords,
      totalWords: additionalState.validWords.length,
      hintsRemaining: this.getRemainingHints(
        additionalState.hints.maxHints,
        additionalState.hints.hintsRevealed
      ),
      revealedWords: additionalState.hints.revealedWords,
      currentScore: game.score,
      possiblePoints: additionalState.possiblePoints,
      progressPercentage: progress.progressPercentage,
      status: game.status,
    };
  }
}