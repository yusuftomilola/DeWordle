import clsx from "clsx"
import { useMemo } from "react"

const rankingThresholds = {
  Beginner: 0,
  "Good Start": 3,
  "Moving Up": 8,
  Good: 14,
  Solid: 25,
  Nice: 42,
  Great: 68,
  Amazing: 85,
  Genius: 118,
}

interface Props {
  score: number
  className?: string
}

export default function RankingProgress({ className, score }: Props) {
  const currentThreshold = useMemo(() => getCurrentThreshold(score), [score])

  return (
    <div className={clsx("relative flex w-full", className)}>
      <div className="w-[100px] mr-4">{currentThreshold}</div>
      <div className="relative h-[28px] grow">
        <div className="absolute top-[13px] h-0 w-full border-b z-[-1]" />
        <div className="flex flex-row justify-between w-full items-center">
          {Object.keys(rankingThresholds).map(renderThreshold)}
        </div>
      </div>
    </div>
  )

  function renderThreshold(label: string) {
    const size = label === currentThreshold ? "h-[28px] w-[28px]" : "h-[14px] w-[14px]"
    const text = label === currentThreshold ? score : ""

    return (
      <div key={label} className={clsx("rounded-full bg-yellow-200 text-center leading-7", size)}>
        {text}
      </div>
    )
  }

  function getCurrentThreshold(score: number) {
    let output: keyof typeof rankingThresholds = "Beginner"
    let threshold: keyof typeof rankingThresholds

    for (threshold in rankingThresholds) {
      const minScore = rankingThresholds[threshold as keyof typeof rankingThresholds]

      if (score >= minScore) {
        output = threshold
      } else {
        break
      }
    }

    return output
  }
}
