"use client"

import clsx from "clsx"

interface Props {
  centerLetter: string
  word: string
  textColor?: string
  className?: string
}

export default function CurrentWord({ className, centerLetter, word, textColor }: Props) {
  return (
    <div className={clsx("text-4xl font-bold h-12 tracking-wider text-indigo-900", className)}>
      {word.split("").map((letter, index) => (
        <span key={index} className={clsx(textColor, { "text-yellow-500": letter === centerLetter && !textColor })}>
          {letter.toUpperCase()}
        </span>
      ))}
    </div>
  )
}
