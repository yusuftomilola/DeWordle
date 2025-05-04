import API from "@/utils/axios"
import { Puzzle, PuzzleDto, PuzzleSubmitWord, PuzzleSubmitWordDto } from "../interfaces/puzzle"
import { AxiosError } from "axios"

export async function loadCurrentPuzzle(): Promise<Puzzle | undefined> {
  try {
    const response = await API.get<PuzzleDto>("/spelling-bee/puzzles/current")

    if (response.status === 404) {
      return undefined
    }

    if (response.status !== 200) {
      console.warn("Can't load current puzzle : " + response.statusText)
      throw new Error("Can't load current puzzle")
    }

    return transformPuzzle(response.data)
  } catch (error) {
    if (error instanceof AxiosError) {
      if (error.response?.status === 404) {
        return undefined
      }
    }

    throw error
  }
}

export async function submitWord(puzzleId: number, word: string): Promise<PuzzleSubmitWord> {
  const response = await API.post<PuzzleSubmitWordDto>(`/spelling-bee/puzzles/${puzzleId}/submit-word`, {
    word,
  })

  if (response.status !== 200) {
    console.warn("Can't submit word : " + response.statusText)
    throw new Error("Can't submit word")
  }

  return response.data
}

function transformPuzzle(puzzleDto: PuzzleDto): Puzzle {
  return {
    id: puzzleDto.id,
    centerLetter: puzzleDto.centerLetter,
    letters: Array.from(new Set(puzzleDto.letters)),
    date: new Date(puzzleDto.date),
  }
}
