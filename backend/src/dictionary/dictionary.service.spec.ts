import { DictionaryService } from './dictionary.service';

describe('DictionaryService', () => {
  let service: DictionaryService;


  beforeEach(() => {
    service = new DictionaryService();
  });

  it('should load and process words correctly', () => {
    expect(service['words'].length).toBeGreaterThan(0);
    expect(service['words']).toContain('example');
  });

  it('should filter words by allowed letters and center letter', () => {
    const allowedLetters = ['a', 'e', 'm', 'p', 'l'];
    const centerLetter = 'm';

    const validWords = service.getValidWords(allowedLetters, centerLetter);

    expect(validWords).toEqual(expect.arrayContaining(['ample', 'maple', 'meal']));
    expect(validWords).not.toContain('apple');
  });

  it('should correctly detect pangrams', () => {
    const allowedLetters = ['a', 'e', 'm', 'p', 'l'];

    expect(service.isPangram('maple', allowedLetters)).toBe(true);
    expect(service.isPangram('ample', allowedLetters)).toBe(true);
    expect(service.isPangram('apple', allowedLetters)).toBe(false);
  });
});
