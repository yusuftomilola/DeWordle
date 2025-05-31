"use client"

import { useCallback, useState } from "react"

import API from "@/utils/axios"
import { canSendWord } from "@/utils/honeycomb/word"
import { submitWord } from "@/services/spelling-bee/connectors/puzzle"
import { Puzzle } from "@/services/spelling-bee/interfaces/puzzle"

export default function useGuess(puzzle: Puzzle | undefined) {
  const [guessedWords, setGuessedWords] = useState<string[]>([])
  const [score, setScore] = useState(0)

  const guess = useCallback(
    async (word: string) => {
      if (!puzzle) {
        return "error"
      }

      if (!canSendWord(word, { mandatoryLetter: puzzle.centerLetter, blacklistWords: guessedWords })) {
        return "error"
      }

      const submitResponse = await submitWord(puzzle.id, word)

      if (submitResponse.valid === true) {
        setGuessedWords((words) => [...words, word])
        setScore((currentScore) => currentScore + submitResponse.score)
        return "success"
      } else {
        return "error"
      }
    },
    [puzzle, guessedWords],
  )

  return {
    guessedWords,
    guess,
    score,
  }
}
