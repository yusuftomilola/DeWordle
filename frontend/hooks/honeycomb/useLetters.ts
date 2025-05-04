import { useCallback, useState } from "react"

export default function useLetters() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [centerLetter, setCenterLetter] = useState("")
  const [outerLetters, setOuterLetters] = useState<string[]>([])

  const load = useCallback(
    async function () {
      // @TODO retrieve letters from API
      setCenterLetter("p")
      setOuterLetters(["o", "i", "n", "a", "c", "t"])

      setIsLoaded(true)
    },
    [setCenterLetter, setOuterLetters],
  )

  return {
    isLoaded,
    centerLetter,
    outerLetters,
    load,
    alphabet: [centerLetter, ...outerLetters],
    shuffleLetters,
  }

  function shuffleLetters() {
    const shuffled = [...outerLetters]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }

    setOuterLetters(shuffled)
  }
}
