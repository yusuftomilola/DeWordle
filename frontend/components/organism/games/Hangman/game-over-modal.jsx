"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"

// interface GameOverModalProps {
//   isOpen: boolean
//   onClose: () => void
//   onPlayAgain: () => void
//   won: boolean
//   word: string
//   category?: string
// }

export default function GameOverModal({ isOpen, onClose, onPlayAgain, won, word, category }) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">
            {won ? (
              <motion.div initial={{ scale: 0 }} animate={{ scale: [0, 1.2, 1] }} transition={{ duration: 0.5 }}>
                🎉 You Won! 🎉
              </motion.div>
            ) : (
              <motion.div initial={{ scale: 0 }} animate={{ scale: [0, 1.2, 1] }} transition={{ duration: 0.5 }}>
                😔 Game Over 😔
              </motion.div>
            )}
          </DialogTitle>
        </DialogHeader>

        <motion.div
          className="text-center py-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          {won ? (
            <motion.p
              className="text-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              Congratulations! You guessed the word correctly.
            </motion.p>
          ) : (
            <div>
              <motion.p
                className="text-lg mb-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                Better luck next time!
              </motion.p>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6, duration: 0.5 }}>
                The word was:{" "}
                <motion.span
                  className="font-bold"
                  initial={{ color: "#000" }}
                  animate={{ color: won ? "#22c55e" : "#ef4444" }}
                  transition={{ delay: 0.8, duration: 0.5 }}
                >
                  {word}
                </motion.span>
              </motion.p>
            </div>
          )}

          {category && (
            <motion.div
              className="mt-3 flex justify-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300 px-3 py-1">
                Category: {category}
              </Badge>
            </motion.div>
          )}
        </motion.div>

        <DialogFooter className="flex justify-center gap-4 sm:justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.5 }}
          >
            <Button variant="outline" onClick={onClose}>
              Main Menu
            </Button>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.5 }}
          >
            <Button onClick={onPlayAgain} className={won ? "bg-green-600 hover:bg-green-700" : ""}>
              Play Again
            </Button>
          </motion.div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
