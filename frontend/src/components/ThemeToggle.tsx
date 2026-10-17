"use client";

import { useTheme } from "@/hooks/useTheme";

const LABELS = { light: "Light", dark: "Dark", system: "System" } as const;

export function ThemeToggle() {
  const { preference, cycleTheme } = useTheme();
  return (
    <button
      type="button"
      onClick={cycleTheme}
      aria-label={`Theme: ${LABELS[preference]}. Activate to switch theme`}
      className="rounded-full px-3 py-1 text-sm text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/60 touch-target"
    >
      {LABELS[preference]}
    </button>
  );
}
