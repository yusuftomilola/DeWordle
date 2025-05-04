"use client"

import useGuess from "@/hooks/honeycomb/useGuess"
import usePuzzle from "@/hooks/honeycomb/usePuzzle"

import HoneycombInputSection from "./InputSection"
import ScoreSection from "./ScoreSection"
import { useEffect } from "react"

export default function HoneycomgGame() {
  const { puzzle, outerLetters, load, shuffleLetters, isLoaded } = usePuzzle()
  const { guessedWords, guess, score } = useGuess(puzzle)

  useEffect(() => {
    load()
  }, [load])

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Loading puzzle</p>
      </div>
    )
  }

  if (!puzzle) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>No available puzzle</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col grow md:flex-row w-full max-w-7xl mx-auto p-4 gap-8 container">
      <HoneycombInputSection
        onSubmitWord={guess}
        centerLetter={puzzle.centerLetter}
        outerLetters={outerLetters}
        shuffleLetters={shuffleLetters}
      />
      <ScoreSection score={score} guessedWords={guessedWords} />
    </div>
  )
}
