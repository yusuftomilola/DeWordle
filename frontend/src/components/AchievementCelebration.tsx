"use client";

import { useEffect } from "react";
import { dismissCurrentAchievement, useCurrentAchievement } from "@/store/useAchievementStore";
import { useSettings } from "@/providers/settings-provider";

export const CELEBRATION_DURATION_MS = 3000;

export function playUnlockSound(): void {
  try {
    const Ctx = window.AudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = 880;
    gain.gain.value = 0.05;
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.25);
  } catch {
    // audio unavailable
  }
}

export function AchievementCelebration({ onSound = playUnlockSound }: { onSound?: () => void }) {
  const achievement = useCurrentAchievement();
  const { soundEffects } = useSettings();
  const id = achievement?.id;

  useEffect(() => {
    if (!id) return;
    if (soundEffects) onSound();
    const timer = window.setTimeout(dismissCurrentAchievement, CELEBRATION_DURATION_MS);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (!achievement) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      data-testid="achievement-celebration"
      className="achievement-celebration fixed inset-0 z-[60] flex items-center justify-center bg-black/60 pointer-events-none"
    >
      <div className="achievement-badge flex flex-col items-center gap-3 rounded-2xl bg-dark-200 p-8 text-white shadow-2xl">
        <span aria-hidden="true" className="text-6xl">{achievement.icon}</span>
        <p className="text-sm uppercase tracking-widest text-gray-400">Achievement unlocked</p>
        <p className="text-2xl font-bold">{achievement.name}</p>
      </div>
    </div>
  );
}
