"use client"

import { createContext, ReactNode, useCallback, useEffect, useState } from "react"

const KeyboardContext = createContext({})

type KeyTapListener = (key: string) => void

export default function useKeyboard(onSubmitWord: (word: string) => void, allowedLetters?: string[]) {
  const [currentWord, setCurrentWord] = useState("")
  const [keyTapListener, setKeyTapListener] = useState<KeyTapListener[]>([])

  const tapLetter = useCallback(
    (key: string) => {
      setCurrentWord((prev) => prev + key)
    },
    [setCurrentWord],
  )

  const reset = useCallback(() => {
    setCurrentWord("")
  }, [setCurrentWord])

  const tapEnter = useCallback(async () => {
    await onSubmitWord(currentWord)
    reset()
  }, [currentWord, onSubmitWord, reset])

  const tapBackSpace = useCallback(() => {
    setCurrentWord((prev) => prev.slice(0, -1))
  }, [setCurrentWord])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase()

      // Handle letter keys
      if (/^[a-z]$/.test(key)) {
        if (!allowedLetters || allowedLetters.includes(key)) {
          tapLetter(key)
          keyTapListener.map((listener) => listener(key))
        }
      }

      // Handle delete/backspace
      if (key === "backspace" || key === "delete") {
        tapBackSpace()
        keyTapListener.map((listener) => listener(key))
      }

      // Handle enter
      if (key === "enter") {
        tapEnter()
        keyTapListener.map((listener) => listener(key))
        e.preventDefault()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [currentWord, allowedLetters, tapBackSpace, tapLetter, tapEnter, keyTapListener])

  const onKeyTap = useCallback(
    (listener: KeyTapListener) => {
      setKeyTapListener((currentListeners) => [...currentListeners, listener])
    },
    [setKeyTapListener],
  )

  return {
    currentWord,
    reset,
    tapLetter,
    tapBackSpace,
    tapEnter,
    onKeyTap,
  }
}
