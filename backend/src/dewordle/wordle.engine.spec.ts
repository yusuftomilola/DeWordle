import {
  evaluateGuess,
  formatEvaluation,
  getStatusSymbols,
  LetterEvaluation,
} from './wordle.engine';

describe('Wordle Engine', () => {
  describe('evaluateGuess', () => {
    it('should correctly evaluate basic cases with no duplicates', () => {
      const result = evaluateGuess('CRANE', 'WORLD');
      expect(result).toEqual([
        { letter: 'C', status: 'absent' },
        { letter: 'R', status: 'present' },
        { letter: 'A', status: 'absent' },
        { letter: 'N', status: 'absent' },
        { letter: 'E', status: 'absent' },
      ]);
    });

    it('should correctly identify all correct letters', () => {
      const result = evaluateGuess('WORLD', 'WORLD');
      expect(result).toEqual([
        { letter: 'W', status: 'correct' },
        { letter: 'O', status: 'correct' },
        { letter: 'R', status: 'correct' },
        { letter: 'L', status: 'correct' },
        { letter: 'D', status: 'correct' },
      ]);
    });

    it('should handle duplicate letters in guess - Example 1: CHEER vs SPEED', () => {
      const result = evaluateGuess('CHEER', 'SPEED');
      expect(result).toEqual([
        { letter: 'C', status: 'absent' },
        { letter: 'H', status: 'absent' },
        { letter: 'E', status: 'correct' },
        { letter: 'E', status: 'correct' },
        { letter: 'R', status: 'absent' },
      ]);
    });

    it('should handle duplicate letters in guess - Example 2: PAPER vs APPLE', () => {
      const result = evaluateGuess('PAPER', 'APPLE');
      expect(result).toEqual([
        { letter: 'P', status: 'present' },
        { letter: 'A', status: 'present' },
        { letter: 'P', status: 'correct' },
        { letter: 'E', status: 'present' },
        { letter: 'R', status: 'absent' },
      ]);
    });

    it('should handle duplicate letters in solution - WHEEL vs ERASE', () => {
      const result = evaluateGuess('ERASE', 'WHEEL');
      expect(result).toEqual([
        { letter: 'E', status: 'present' },
        { letter: 'R', status: 'absent' },
        { letter: 'A', status: 'absent' },
        { letter: 'S', status: 'absent' },
        { letter: 'E', status: 'present' },
      ]);
    });

    it('should handle multiple duplicates correctly - GEESE vs SPEED', () => {
      const result = evaluateGuess('GEESE', 'SPEED');
      expect(result).toEqual([
        { letter: 'G', status: 'absent' },
        { letter: 'E', status: 'present' },
        { letter: 'E', status: 'correct' },
        { letter: 'S', status: 'present' },
        { letter: 'E', status: 'absent' },
      ]);
    });

    it('should handle case where guess has more duplicates than solution - LLAMA vs APPLE', () => {
      const result = evaluateGuess('LLAMA', 'APPLE');
      expect(result).toEqual([
        { letter: 'L', status: 'present' },
        { letter: 'L', status: 'absent' },
        { letter: 'A', status: 'present' },
        { letter: 'M', status: 'absent' },
        { letter: 'A', status: 'absent' },
      ]);
    });

    it('should be case insensitive', () => {
      const result1 = evaluateGuess('crane', 'WORLD');
      const result2 = evaluateGuess('CRANE', 'world');
      const result3 = evaluateGuess('CrAnE', 'WoRlD');

      const expected = [
        { letter: 'C', status: 'absent' },
        { letter: 'R', status: 'present' },
        { letter: 'A', status: 'absent' },
        { letter: 'N', status: 'absent' },
        { letter: 'E', status: 'absent' },
      ];

      expect(result1).toEqual(expected);
      expect(result2).toEqual(expected);
      expect(result3).toEqual(expected);
    });

    it('should handle whitespace in inputs', () => {
      const result = evaluateGuess(' CRANE ', ' WORLD ');
      expect(result).toEqual([
        { letter: 'C', status: 'absent' },
        { letter: 'R', status: 'present' },
        { letter: 'A', status: 'absent' },
        { letter: 'N', status: 'absent' },
        { letter: 'E', status: 'absent' },
      ]);
    });

    it('should throw error for invalid input lengths', () => {
      expect(() => evaluateGuess('CRAN', 'WORLD')).toThrow(
        'Both guess and solution must be exactly 5 letters long',
      );
      expect(() => evaluateGuess('CRANES', 'WORLD')).toThrow(
        'Both guess and solution must be exactly 5 letters long',
      );
      expect(() => evaluateGuess('CRANE', 'WORL')).toThrow(
        'Both guess and solution must be exactly 5 letters long',
      );
      expect(() => evaluateGuess('CRANE', 'WORLDS')).toThrow(
        'Both guess and solution must be exactly 5 letters long',
      );
    });
  });

  describe('formatEvaluation', () => {
    it('should format evaluation results correctly', () => {
      const evaluation: LetterEvaluation[] = [
        { letter: 'C', status: 'absent' },
        { letter: 'R', status: 'present' },
        { letter: 'A', status: 'correct' },
        { letter: 'N', status: 'absent' },
        { letter: 'E', status: 'present' },
      ];

      const formatted = formatEvaluation(evaluation);
      expect(formatted).toBe(
        'C: absent ⬜, R: present 🟨, A: correct 🟩, N: absent ⬜, E: present 🟨',
      );
    });
  });

  describe('getStatusSymbols', () => {
    it('should return only status symbols', () => {
      const evaluation: LetterEvaluation[] = [
        { letter: 'C', status: 'absent' },
        { letter: 'R', status: 'present' },
        { letter: 'A', status: 'correct' },
        { letter: 'N', status: 'absent' },
        { letter: 'E', status: 'present' },
      ];

      const symbols = getStatusSymbols(evaluation);
      expect(symbols).toBe('⬜🟨🟩⬜🟨');
    });
  });
});
