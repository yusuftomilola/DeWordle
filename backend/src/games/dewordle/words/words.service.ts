import { Injectable } from '@nestjs/common';

// @Injectable()
// export class WordsService {
//     private words = [
//       'apple', 'brave', 'climb', 'dream', 'eagle', 'flame', 'grape', 'house', 'input', 'jolly',
//       'knife', 'lemon', 'march', 'noble', 'ocean', 'pride', 'queen', 'river', 'shine', 'trick',
//       'urban', 'vivid', 'whale', 'xenon', 'yield', 'zebra', 'bliss', 'crash', 'dance', 'eager',
//       'fresh', 'globe', 'honey', 'ivory', 'joker', 'karma', 'latch', 'moose', 'nifty', 'oasis',
//       'pearl', 'quest', 'rusty', 'spear', 'tiger', 'unite', 'voter', 'waltz', 'xerox', 'yacht',
//       'zeal', 'bingo', 'charm', 'dusty', 'elite', 'frank', 'grill', 'haste', 'index', 'jumpy',
//       'knack', 'lucky', 'mirth', 'neigh', 'oxide', 'piano', 'quart', 'roach', 'sheep', 'taste',
//       'umbra', 'viper', 'woven', 'xylem', 'youth', 'zonal', 'basil', 'chase', 'drape', 'erase',
//       'feast', 'glint', 'hinge', 'inbox', 'jaunt', 'knock', 'lapse', 'mossy', 'nerve', 'overt',
//       'penny', 'quake', 'ridge', 'stout', 'trust', 'usher', 'vault', 'wrist', 'xeric', 'yield',
//       'zippy', 'brood', 'cloak', 'dusty', 'elbow', 'frill', 'grasp', 'hasty', 'irony', 'joint',
//       'kneel', 'latch', 'mover', 'nicer', 'opera', 'plain', 'quiet', 'reign', 'slant', 'tramp',
//       'urged', 'vigor', 'woken', 'xenon', 'yearn', 'zoned', 'blast', 'clout', 'drain', 'exact',
//       'froze', 'gloom', 'hatch', 'ivory', 'judge', 'knoll', 'layer', 'mocha', 'noble', 'olive',
//       'plead', 'quote', 'ridge', 'split', 'trust', 'unfit', 'vital', 'woven', 'xerox', 'yarns',
//       'zebra', 'batch', 'crave', 'debit', 'event', 'flute', 'grape', 'horde', 'idiom', 'jazzy',
//       'knead', 'lunar', 'mirth', 'ninth', 'orbit', 'perky', 'quilt', 'rouse', 'sworn', 'thief',
//       'upset', 'vivid', 'woken', 'xeric', 'young', 'zoned', 'blank', 'chart', 'douse', 'evoke',
//       'froth', 'grasp', 'haunt', 'inlet', 'juror', 'knack', 'latch', 'mirth', 'nudge', 'oasis',
//       'plush', 'quail', 'ridge', 'spout', 'thumb', 'unwed', 'voter', 'wince', 'xenon', 'yield',
//       'zonal'
//     ];

//     private wordOfTheDay: string = '';

//     constructor() {
//       this.generateWordOfTheDay();
//       setInterval(() => this.generateWordOfTheDay(), 24 * 60 * 60 * 1000);
//     }

//     generateWordOfTheDay() {
//       const today = new Date();
//       const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
//       this.wordOfTheDay = this.words[dayOfYear % this.words.length];
//     }

//     getWordOfTheDay() {
//       return this.wordOfTheDay;
//     }

//     validateGuess(guess: string): { correct: boolean; hint: string } {
//       let hint = '';

//       for (let i = 0; i < guess.length; i++) {
//         if (guess[i] === this.wordOfTheDay[i]) {
//           hint += '🟩';
//         } else if (this.wordOfTheDay.includes(guess[i])) {
//           hint += '🟨';
//         } else {
//           hint += '⬜';
//         }
//       }

//       return { correct: guess === this.wordOfTheDay, hint };
//     }
//   }

export class WordsService {
  private wordOfTheDay: string = '';

  constructor() {
    this.generateWordOfTheDay();
    setInterval(() => this.generateWordOfTheDay(), 24 * 60 * 60 * 1000); // Refresh every 24 hours
  }

  async generateWordOfTheDay() {
    try {
      const response = await fetch(
        'https://random-word-api.herokuapp.com/word?length=5',
      );
      const data = await response.json();
      this.wordOfTheDay = data[0];
    } catch (error) {
      console.error('Error fetching word of the day:', error);
      this.wordOfTheDay = 'apple'; // Fallback in case of an error
    }
  }

  getWordOfTheDay() {
    return this.wordOfTheDay;
  }

  validateGuess(guess: string): { correct: boolean; hint: string } {
    let hint = '';

    for (let i = 0; i < guess.length; i++) {
      if (guess[i] === this.wordOfTheDay[i]) {
        hint += '🟩'; // Correct letter in the correct position
      } else if (this.wordOfTheDay.includes(guess[i])) {
        hint += '🟨'; // Correct letter in the wrong position
      } else {
        hint += '⬜'; // Incorrect letter
      }
    }

    return { correct: guess === this.wordOfTheDay, hint };
  }
}
