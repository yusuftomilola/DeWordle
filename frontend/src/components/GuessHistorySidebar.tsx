"use client";

import { useState } from "react";
import { useGuessHistory, type LetterState } from "@/store/useGuessHistoryStore";

// Same palette as GameTile
const STATE_CLASSES: Record<LetterState, string> = {
  correct: "border-green-600 bg-green-600 text-white",
  present: "border-yellow-500 bg-yellow-500 text-white",
  absent: "border-gray-600 bg-gray-600 text-white",
};

export function GuessHistorySidebar() {
  const guesses = useGuessHistory();
  const [open, setOpen] = useState(true);

  return (
    <aside aria-label="Guess history" className="w-full md:w-56 rounded-lg border border-white/10 bg-dark-200/50 p-3">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="guess-history-list"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between text-sm font-semibold text-white md:cursor-default"
      >
        <span>Guesses ({guesses.length})</span>
        <span aria-hidden="true" className="md:hidden">{open ? "−" : "+"}</span>
      </button>
      <ol
        id="guess-history-list"
        hidden={!open}
        className="mt-2 max-h-64 flex-col gap-1 overflow-y-auto md:max-h-[28rem] md:!flex [&:not([hidden])]:flex"
      >
        {guesses.length === 0 && <li className="text-xs text-gray-400">No guesses yet</li>}
        {guesses.map((guess, index) => {
          const isLatest = index === guesses.length - 1;
          return (
            <li
              key={`${guess.submittedAt}-${index}`}
              aria-current={isLatest ? "true" : undefined}
              data-latest={isLatest ? "true" : undefined}
              className={`flex gap-1 rounded p-1 ${isLatest ? "bg-white/10 ring-1 ring-white/40" : ""}`}
            >
              <span className="sr-only">Guess {index + 1}: {guess.word}</span>
              {guess.letters.map((l, i) => (
                <span
                  key={i}
                  aria-hidden="true"
                  data-state={l.state}
                  className={`flex h-8 w-8 items-center justify-center border text-sm font-bold uppercase ${STATE_CLASSES[l.state]}`}
                >
                  {l.letter}
                </span>
              ))}
            </li>
          );
        })}
      </ol>
    </aside>
  );
}
