"use client"

import CurrentWord from "@/components/atoms/Spelling-bee/CurrentWord"
import HexKeyboard from "@/components/molecules/HexKeyboard"
import useKeyboard from "@/hooks/honeycomb/useKeyboard"
import InputControls from "./InputControls"
import { useCallback, useState } from "react"

interface Props {
  onSubmitWord: (word: string) => Promise<"error" | "success">
  centerLetter: string
  outerLetters: string[]
  shuffleLetters: () => void
}

export default function HoneycombInputSection({ onSubmitWord, centerLetter, outerLetters, shuffleLetters }: Props) {
  const [textColor, setTextColor] = useState<string>()

  const resetWord = useCallback(
    async (state: string) => {
      return new Promise(function (resolve) {
        const color = state === "success" ? "text-green-500 drop-shadow-success" : "text-red-500 drop-shadow-error"

        setTextColor(color)
        setTimeout(() => {
          setTextColor(color + " opacity-0 transition-opacity duration-200 ease-in")
        }, 0)

        setTimeout(() => {
          setTextColor(undefined)
          resolve(true)
        }, 200)
      })
    },
    [setTextColor],
  )

  const submitCallback = useCallback(
    async (word: string) => {
      const status = await onSubmitWord(word)
      await resetWord(status)
    },
    [onSubmitWord, resetWord],
  )

  const { currentWord, tapLetter, tapBackSpace, tapEnter, onKeyTap, reset } = useKeyboard(submitCallback, [
    centerLetter,
    ...outerLetters,
  ])

  return (
    <div className="flex-1 flex flex-col items-center mt-20">
      <CurrentWord className="mb-6" word={currentWord} centerLetter={centerLetter} textColor={textColor} />
      <HexKeyboard
        centerLetter={centerLetter}
        outerLetters={outerLetters}
        onKeyTap={tapLetter}
        onKeyTapListener={onKeyTap}
        keySize="120px"
      />
      <InputControls tapBack={tapBackSpace} tapEnter={tapEnter} shuffleLetters={shuffleLetters} />
    </div>
  )
}
