import { useSyncExternalStore } from "react";

export interface UnlockedAchievement {
  id: string;
  name: string;
  icon: string;
}

let queue: readonly UnlockedAchievement[] = [];
const EMPTY: readonly UnlockedAchievement[] = [];
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

/** Called when the app receives an achievement-unlock event. */
export function announceAchievement(achievement: UnlockedAchievement): void {
  if (queue.some((a) => a.id === achievement.id)) return;
  queue = [...queue, achievement];
  emit();
}

export function dismissCurrentAchievement(): void {
  if (queue.length === 0) return;
  queue = queue.slice(1);
  emit();
}

export function clearAchievements(): void {
  queue = [];
  emit();
}

export function useCurrentAchievement(): UnlockedAchievement | null {
  const q = useSyncExternalStore(subscribe, () => queue, () => EMPTY);
  return q[0] ?? null;
}
