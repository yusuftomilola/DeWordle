"use client"

import { useCallback, useState } from "react"

import API from "@/utils/axios"
import { canSendWord } from "@/utils/honeycomb/word"

export default function useGuess(centerLetter: string, alphabet: string[]) {
  const [guessedWords, setGuessedWords] = useState<string[]>([])
  const [score, setScore] = useState(0)

  const guess = useCallback(
    async (word: string) => {
      if (!canSendWord(word, { mandatoryLetter: centerLetter, blacklistWords: guessedWords })) {
        return "error"
      }

      const response = await API.post("/spelling-bee/submit-word", {
        word,
        puzzle: { centerLetter, allowedLetters: alphabet, submittedWords: [] },
      })

      if (response.data.valid === true) {
        setGuessedWords((words) => [...words, word])
        setScore((currentScore) => currentScore + response.data.score)
        return "success"
      } else {
        return "error"
      }
    },
    [alphabet, guessedWords, centerLetter],
  )

  return {
    guessedWords,
    guess,
    score,
  }
}
