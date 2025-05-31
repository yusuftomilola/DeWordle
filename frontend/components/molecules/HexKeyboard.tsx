"use client"

import { createRef, RefObject, useCallback, useEffect, useRef, useState } from "react"
import HexKey, { type HexKeyRef } from "@/components/atoms/Spelling-bee/HexKey"

const centerLetterColor = "bg-yellow-200 text-indigo-900"
const outerLettersColor = "bg-gray-200 text-indigo-900 hover:bg-gray-300"

const CELL_POSITIONS = [
  "left-1/3 top-0",
  "left-[4.466667%] top-[16.666667%]",
  "left-[4.466667%] top-1/2",
  "left-1/3 top-2/3",
  "left-[62.2%] top-1/2",
  "left-[62.2%] top-[16.666667%]",
]

interface Props {
  centerLetter: string
  outerLetters: string[]
  onKeyTap: (letter: string) => void
  onKeyTapListener: (cb: (letter: string) => void) => void
  keySize: string
}

export default function HexKeyboard({ centerLetter, outerLetters, onKeyTap, onKeyTapListener, keySize }: Props) {
  const [shuffledOuterLetters, setShuffledOuterLetters] = useState<string[]>(outerLetters)

  const buttonsRefs = useRef<Record<string, RefObject<HexKeyRef>>>({})
  buttonsRefs.current = [centerLetter, ...outerLetters].reduce(
    (outout, letter) => ({
      ...outout,
      [letter]: buttonsRefs.current[letter] ?? createRef(),
    }),
    {},
  )

  useEffect(() => {
    if (onKeyTapListener) {
      onKeyTapListener((key: string) => {
        buttonsRefs.current[key]?.current.animate("tap")
      })
    }
  }, [onKeyTapListener])

  useEffect(() => {
    if (outerLetters.length === 0) return

    Object.entries(buttonsRefs.current)
      .filter(([letter]) => letter !== centerLetter)
      .forEach(([, keyRef]) => keyRef.current?.animate("shuffling"))

    setTimeout(() => {
      setShuffledOuterLetters(outerLetters)
    }, 250)
  }, [centerLetter, outerLetters])

  const handleLetterTap = useCallback(
    (key: string) => {
      buttonsRefs.current[key].current.animate("tap")
      onKeyTap(key)
    },
    [buttonsRefs, onKeyTap],
  )

  return (
    <div className="aspect-square mb-8" style={{ width: `calc(3*${keySize})` }}>
      <div className="relative mx-auto w-full h-full">
        {/* Center hexagon */}
        <HexKey
          ref={buttonsRefs.current[centerLetter]}
          className={`${centerLetterColor} left-1/3 top-1/3`}
          text={centerLetter?.toUpperCase()}
          onClick={() => handleLetterTap(centerLetter)}
          keySize={keySize}
        />

        {/* Outer hexagons */}
        {shuffledOuterLetters.map((letter, index) => (
          <HexKey
            ref={buttonsRefs.current[letter]}
            key={letter}
            className={`${outerLettersColor} ${CELL_POSITIONS[index]}`}
            text={letter.toUpperCase()}
            onClick={() => handleLetterTap(letter)}
            keySize={keySize}
          />
        ))}
      </div>
    </div>
  )
}

const variants = {
  rotate: { rotate: [0, -30, 0], transition: { duration: 0.5 } },
  stop: { y: [0, -10, 0], transition: { repeat: Infinity, repeatDelay: 3 } },
}
