"use client"

import useGuess from "@/hooks/honeycomb/useGuess"
import useLetters from "@/hooks/honeycomb/useLetters"

import HoneycombInputSection from "./InputSection"
import ScoreSection from "./ScoreSection"
import { useEffect } from "react"

export default function HoneycomgGame() {
  const { alphabet, centerLetter, outerLetters, load, shuffleLetters, isLoaded } = useLetters()
  const { guessedWords, guess, score } = useGuess(centerLetter, alphabet)

  useEffect(() => {
    load()
  }, [load])

  return (
    <div className="flex flex-col grow md:flex-row w-full max-w-7xl mx-auto p-4 gap-8 container">
      <HoneycombInputSection
        onSubmitWord={guess}
        centerLetter={centerLetter}
        outerLetters={outerLetters}
        shuffleLetters={shuffleLetters}
      />
      <ScoreSection score={score} guessedWords={guessedWords} />
    </div>
  )
}
