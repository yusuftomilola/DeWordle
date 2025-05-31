// interface WordDisplayProps {
//   word: string
//   guessedLetters: string[]
//   gameOver: boolean
// }

export default function WordDisplay({ word, guessedLetters, gameOver }) {
  return (
    <div className="flex justify-center my-6 gap-2">
      {word.split("").map((letter, index) => (
        <div key={index} className="w-8 h-10 border-b-2 border-gray-700 flex items-center justify-center">
          <span className="text-xl font-bold">{guessedLetters.includes(letter) || gameOver ? letter : ""}</span>
        </div>
      ))}
    </div>
  )
}
