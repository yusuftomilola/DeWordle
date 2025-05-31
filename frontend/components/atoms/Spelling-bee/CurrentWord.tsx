
"use client";

interface Props {
  centerLetter: string;
  word: string;
  textColor?: string;
  className?: string;
}

export default function CurrentWord({ className = "", centerLetter, word, textColor }: Props) {
  return (
    <div className={`text-4xl font-bold h-12 tracking-wider text-indigo-900 ${className}`}>
      {word.split("").map((letter, index) => {
        const isCenter = letter === centerLetter;
        const colorClass = textColor ? textColor : isCenter ? "text-yellow-500" : "";
        return (
          <span key={index} className={colorClass}>
            {letter.toUpperCase()}
          </span>
        );
      })}
    </div>
  );
}
