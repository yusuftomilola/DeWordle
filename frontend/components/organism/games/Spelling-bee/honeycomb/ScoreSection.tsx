import RankingProgress from "@/components/atoms/Spelling-bee/RankingProgess"

interface Props {
  score: number
  guessedWords: string[]
}

export default function ScoreSection({ guessedWords, score }: Props) {
  return (
    <div className="flex-1 mb-5">
      <RankingProgress score={score} className="mb-5" />
      <div className="border rounded-lg p-6">
        <h2 className="text-lg mb-4">
          You have found {guessedWords.length} {guessedWords.length === 1 ? "word" : "words"}
        </h2>
        {guessedWords.map(renderGuessedWord)}
      </div>
    </div>
  )

  function renderGuessedWord(word: string) {
    return (
      <div key={word} className="w-40 mb-4 border-b border-slate-300">
        {word.toUpperCase()}
      </div>
    )
  }
}
