import { PuzzleGeneratorService } from './PuzzleGenerator.service';
import { DictionaryService } from '../../../dictionary/dictionary.service';

describe('PuzzleGeneratorService', () => {
  const mockWords = [
    'triangle',
    'alert',
    'angle',
    'glean',
    'eating',
    'relating',
  ];

  const mockService = {
    getValidWords: jest.fn(),
    isPangram: jest.fn(),
    words: mockWords,
  } as unknown as DictionaryService;

  it('should generate a puzzle with correct structure and logic', () => {
    mockService.isPangram = jest.fn((word, letters) => {
      const wordSet = new Set(word);
      return letters.every((l) => wordSet.has(l));
    });

    mockService.getValidWords = jest.fn((letters, center) => {
      const valid = ['angle', 'alert', 'glean'];
      return valid.filter(
        (word) =>
          word.includes(center) && [...word].every((c) => letters.includes(c)),
      );
    });

    const generator = new PuzzleGeneratorService(mockService);
    const puzzle = generator.generatePuzzle();

    //Validate center letter
    expect(puzzle.center).toBeDefined();
    expect(puzzle.letters).toContain(puzzle.center);

    //  Validate all words include center and use only allowed letters
    for (const word of puzzle.validWords) {
      expect(word).toContain(puzzle.center);
      for (const c of word) {
        expect(puzzle.letters).toContain(c);
      }
    }

    //  Validate pangram matches the definition
    expect(mockService.isPangram(puzzle.pangram, puzzle.letters)).toBe(true);
    expect(new Set(puzzle.letters).size).toBeGreaterThanOrEqual(7);
  });
});
