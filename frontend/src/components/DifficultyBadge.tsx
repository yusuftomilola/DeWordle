"use client";

import { useEffect, useState } from "react";
import { DIFFICULTY_META, SCORING_CRITERIA, fetchDailyDifficulty, type Difficulty } from "@/lib/difficulty";
import { useSettings } from "@/providers/settings-provider";

export function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  const meta = DIFFICULTY_META[difficulty];
  return (
    <span
      tabIndex={0}
      title={SCORING_CRITERIA}
      aria-label={`Difficulty: ${meta.label}. ${SCORING_CRITERIA}`}
      data-difficulty={difficulty}
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${meta.className}`}
    >
      {meta.label}
    </span>
  );
}

/** Start-screen badge: fetched from the API, hidden via settings or on failure. */
export function DailyDifficultyBadge({ fetchImpl }: { fetchImpl?: typeof fetch }) {
  const { showDifficultyBadge } = useSettings();
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);

  useEffect(() => {
    if (!showDifficultyBadge) return;
    let cancelled = false;
    void fetchDailyDifficulty(fetchImpl).then((d) => {
      if (!cancelled) setDifficulty(d);
    });
    return () => {
      cancelled = true;
    };
  }, [showDifficultyBadge, fetchImpl]);

  if (!showDifficultyBadge || !difficulty) return null;
  return <DifficultyBadge difficulty={difficulty} />;
}
