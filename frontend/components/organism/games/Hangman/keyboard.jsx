"use client"
import { memo } from "react"
import { motion } from "framer-motion"

// interface KeyboardProps {
//   guessedLetters: string[]
//   onGuess: (letter: string) => void
//   word: string
//   disabled: boolean
// }

// Using memo to prevent unnecessary re-renders
const Keyboard = memo(function Keyboard({ guessedLetters, onGuess, word, disabled }) {
  const rows = [
    ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
    ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
    ["Z", "X", "C", "V", "B", "N", "M"],
  ]

  const getKeyClass = (letter) => {
    if (guessedLetters.includes(letter)) {
      return word.includes(letter) ? "bg-green-500 text-white shadow-md" : "bg-red-500 text-white shadow-md"
    }
    return "bg-gray-200 hover:bg-gray-300 active:bg-gray-400 shadow"
  }

  const handleKeyDown = (e, letter) => {
    // Handle keyboard navigation
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      if (!guessedLetters.includes(letter) && !disabled) {
        onGuess(letter)
      }
    }
  }

  return (
    <div className="w-full max-w-md mx-auto mt-6" role="group" aria-label="Keyboard">
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className="flex justify-center mb-2" role="row">
          {row.map((letter) => {
            const isGuessed = guessedLetters.includes(letter)
            const isCorrect = word.includes(letter) && isGuessed

            return (
              <motion.button
                key={letter}
                onClick={() => onGuess(letter)}
                onKeyDown={(e) => handleKeyDown(e, letter)}
                disabled={isGuessed || disabled}
                whileHover={!isGuessed && !disabled ? { scale: 1.1 } : {}}
                whileTap={!isGuessed && !disabled ? { scale: 0.95 } : {}}
                className={`${getKeyClass(letter)} w-8 h-10 sm:w-9 sm:h-11 md:w-10 md:h-12 m-0.5 sm:m-1 rounded font-bold transition-colors duration-200 ${
                  isGuessed ? "cursor-default" : "cursor-pointer"
                }`}
                aria-pressed={isGuessed}
                aria-disabled={disabled}
                aria-label={`Letter ${letter}${isGuessed ? (isCorrect ? ", correct" : ", incorrect") : ""}`}
              >
                {letter}
              </motion.button>
            )
          })}
        </div>
      ))}
    </div>
  )
})

export default Keyboard
