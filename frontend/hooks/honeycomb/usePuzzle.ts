import { useCallback, useState } from "react"

import { loadCurrentPuzzle } from "@/services/spelling-bee/connectors/puzzle"
import { Puzzle } from "@/services/spelling-bee/interfaces/puzzle"
import { shuffle } from "@/utils/array"

export default function usePuzzle() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [puzzle, setPuzzle] = useState<Puzzle>()
  const [outerLetters, setOuterLetters] = useState<string[]>([])

  const load = useCallback(
    async function () {
      const puzzle = await loadCurrentPuzzle()

      if (!puzzle) {
        setIsLoaded(true)
        return
      }

      setPuzzle(puzzle)
      setOuterLetters(shuffle(puzzle.letters.filter((l) => l !== puzzle.centerLetter)))

      setIsLoaded(true)
    },
    [setPuzzle, setOuterLetters],
  )

  const shuffleLetters = useCallback(() => {
    if (puzzle) {
      setOuterLetters(shuffle(puzzle.letters.filter((l) => l !== puzzle.centerLetter)))
    }
  }, [puzzle, setOuterLetters])

  return {
    isLoaded,
    puzzle,
    outerLetters,
    load,
    shuffleLetters,
  }
}
