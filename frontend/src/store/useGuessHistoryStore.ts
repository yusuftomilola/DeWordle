import { useSyncExternalStore } from "react";

export type LetterState = "correct" | "present" | "absent";

export interface GuessLetter {
  letter: string;
  state: LetterState;
}

export interface GuessEntry {
  word: string;
  letters: GuessLetter[];
  submittedAt: number;
}

const EMPTY: readonly GuessEntry[] = [];
let guesses: readonly GuessEntry[] = EMPTY;
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

export function recordGuess(letters: GuessLetter[], submittedAt = Date.now()): void {
  if (letters.length === 0) return;
  const word = letters.map((l) => l.letter).join("").toLowerCase();
  guesses = [...guesses, { word, letters, submittedAt }];
  emit();
}

export function replaceGuesses(entries: GuessEntry[]): void {
  guesses = [...entries];
  emit();
}

export function clearGuesses(): void {
  if (guesses.length === 0) return;
  guesses = EMPTY;
  emit();
}

export function getGuesses(): readonly GuessEntry[] {
  return guesses;
}

export function useGuessHistory(): readonly GuessEntry[] {
  return useSyncExternalStore(subscribe, getGuesses, () => EMPTY);
}
