interface PuzzleDto {
  centerLetter: string;
  allowedLetters: string[]; // includes center letter
  submittedWords: string[]; // already submitted
}