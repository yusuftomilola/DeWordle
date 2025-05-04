import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { useCallback, useState } from "react"

interface Props {
  tapEnter: () => void
  tapBack: () => void
  shuffleLetters: () => void
}

export default function InputControls({ tapEnter, tapBack, shuffleLetters }: Props) {
  const [isShuffling, setIsShuffling] = useState(false)

  const onShuffle = useCallback(() => {
    setIsShuffling(true)
    shuffleLetters()

    setTimeout(() => {
      setIsShuffling(false)
    }, 500)
  }, [setIsShuffling, shuffleLetters])

  return (
    <div className="flex gap-4">
      <Button variant="outline" onClick={tapBack} className="px-6 rounded-3xl">
        Delete
      </Button>
      <Button variant="outline" onClick={onShuffle} className="w-10 h-10 p-0 rounded-full" disabled={isShuffling}>
        <RefreshCw className={`w-4 h-4 ${isShuffling ? "animate-spin" : ""}`} />
      </Button>
      <Button variant="outline" onClick={tapEnter} className="px-6 rounded-3xl ">
        Enter
      </Button>
    </div>
  )
}
