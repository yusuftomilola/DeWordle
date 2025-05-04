"use client"

import { RefObject, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

const animationVariants = {
  shuffling: {
    scale: 0.8,
    opacity: 0.5,
    transition: { duration: 0.5 },
  },
  tap: {
    scale: 0.9,
    opacity: 0.8,
    transition: { duration: 0.2 },
  },
  default: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5 },
  },
}

type AnimationName = keyof typeof animationVariants

export interface HexKeyRef {
  animate: (animationName: AnimationName) => void
}

interface Props {
  className?: string
  onClick: () => void
  text: string
  ref?: RefObject<HexKeyRef>
  keySize: string
}

export default function HexKey({ className, onClick, text, ref, keySize }: Props) {
  const [currentAnimation, setCurrentAnimation] = useState<AnimationName>("default")

  if (ref) {
    ref.current = {
      animate(animationName: AnimationName) {
        const animation = animationVariants[animationName]

        if (animation) {
          const duration = animation.transition.duration * 1000

          setCurrentAnimation(animationName)

          setTimeout(() => {
            setCurrentAnimation("default")
          }, duration)
        }
      },
    }
  }

  return (
    <AnimatePresence>
      <motion.button
        className={`absolute transform hexagon flex items-center justify-center text-5xl leading-[3rem] font-normal cursor-pointer ${className}`}
        style={{ width: keySize }}
        onClick={onClick}
        variants={animationVariants}
        animate={currentAnimation}
        initial={{ scale: 0, opacity: 0 }}
        exit={{ opacity: 0, scale: 0.8 }}
      >
        {text}
      </motion.button>
    </AnimatePresence>
  )
}
