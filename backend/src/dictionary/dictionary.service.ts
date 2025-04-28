import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class DictionaryService {
  private words: string[] = [];

  constructor() {
    this.loadWords();
  }

  private loadWords() {
    const filePath = path.join(process.cwd(), 'static', 'words.txt');
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }
    const data = fs.readFileSync(filePath, 'utf-8');
    this.words = data
      .split('\n')
      .map(word => word.trim().toLowerCase())
      .filter(word => word.length > 0);
  }

  public getValidWords(allowedLetters: string[], centerLetter: string): string[] {
    const allowedSet = new Set(allowedLetters.map(letter => letter.toLowerCase()));
    const center = centerLetter.toLowerCase();

    return this.words.filter(word => 
      word.includes(center) &&
      [...word].every(letter => allowedSet.has(letter))
    );
  }

  public isPangram(word: string, allowedLetters: string[]): boolean {
    const wordSet = new Set(word.toLowerCase());
    const allowedSet = new Set(allowedLetters.map(letter => letter.toLowerCase()));

    for (const letter of allowedSet) {
      if (!wordSet.has(letter)) {
        return false;
      }
    }
    return true;
  }
}
