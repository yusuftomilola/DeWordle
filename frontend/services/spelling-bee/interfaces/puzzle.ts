export interface PuzzleDto {
  id: number
  letters: string
  centerLetter: string
  date: string
}

export interface Puzzle {
  id: number
  letters: string[]
  centerLetter: string
  date: Date
}

export interface PuzzleSubmitWordRequestBodyDto {
  word: string
}

export type PuzzleSubmitWordDto =
  | {
      valid: true
      score: number
    }
  | { valid: false; score: 0; reason: string }

export type PuzzleSubmitWord = PuzzleSubmitWordDto
