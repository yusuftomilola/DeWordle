export type Difficulty = "EASY" | "MEDIUM" | "HARD";

export const DIFFICULTY_META: Record<Difficulty, { label: string; className: string }> = {
  EASY: { label: "Easy", className: "bg-green-600 text-white" },
  MEDIUM: { label: "Medium", className: "bg-yellow-500 text-black" },
  HARD: { label: "Hard", className: "bg-red-600 text-white" },
};

export const SCORING_CRITERIA =
  "Rated by how common the word is (70%) and letter complexity such as rare letters, repeats and vowel balance (30%).";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

/** Reads only the difficulty rating from the daily word endpoint. */
export async function fetchDailyDifficulty(
  fetchImpl: typeof fetch = fetch,
  base: string = API_BASE,
): Promise<Difficulty | null> {
  try {
    const res = await fetchImpl(`${base}/api/v1/words/daily`);
    if (!res.ok) return null;
    const body = (await res.json()) as { difficulty?: string } | null;
    const d = body?.difficulty?.toUpperCase();
    return d === "EASY" || d === "MEDIUM" || d === "HARD" ? d : null;
  } catch {
    return null;
  }
}
