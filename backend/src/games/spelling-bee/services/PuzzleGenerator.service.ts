import { Injectable } from '@nestjs/common';
import { DictionaryService } from '../../../dictionary/dictionary.service';
import { PuzzleDTO } from '../dto/puzzal.dto';

@Injectable()
export class PuzzleGeneratorService {
  constructor(private readonly dictionaryService: DictionaryService) {}

  generatePuzzle(): PuzzleDTO {
    const pangramSeed = this.selectPangramSeed();

    const letters = Array.from(new Set(pangramSeed));
    const center = this.getRandomItem(letters);

    const validWords = this.dictionaryService.getValidWords(letters, center);

    return {
      center,
      letters,
      validWords,
      pangram: pangramSeed,
    };
  }

  private selectPangramSeed(): string {
    const candidates = this.dictionaryService['words'].filter((word) => {
      const letters = Array.from(new Set(word));
      return (
        letters.length >= 7 && this.dictionaryService.isPangram(word, letters)
      );
    });

    if (candidates.length === 0) {
      throw new Error('No_pangram_seed_found_in_dictionary');
    }

    return this.getRandomItem(candidates);
  }

  private getRandomItem<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
  }
}
