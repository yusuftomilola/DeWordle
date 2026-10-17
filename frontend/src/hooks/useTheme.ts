"use client";

import { useCallback, useEffect, useState } from "react";
import { applyTheme, resolveTheme, THEME_STORAGE_KEY, type ThemePreference } from "@/lib/theme";

const ORDER: ThemePreference[] = ["light", "dark", "system"];

function readPreference(): ThemePreference {
  try {
    const raw = localStorage.getItem(THEME_STORAGE_KEY);
    const theme = raw ? JSON.parse(raw).theme : undefined;
    if (ORDER.includes(theme)) return theme;
  } catch {
    // storage unavailable
  }
  return "system";
}

function persist(theme: ThemePreference) {
  try {
    const raw = localStorage.getItem(THEME_STORAGE_KEY);
    const current = raw ? JSON.parse(raw) : {};
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify({ ...current, theme }));
  } catch {
    // storage unavailable
  }
}

/**
 * Light / dark / system theme. "system" follows `prefers-color-scheme` and
 * reacts live to OS changes. The preference is stored alongside the other
 * visual settings.
 */
export function useTheme() {
  const [preference, setPreference] = useState<ThemePreference>("system");
  const [systemDark, setSystemDark] = useState(false);

  useEffect(() => {
    setPreference(readPreference());
    const mq = window.matchMedia?.("(prefers-color-scheme: dark)");
    if (!mq) return;
    setSystemDark(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const resolved = resolveTheme(preference, systemDark);

  useEffect(() => {
    applyTheme(resolved);
  }, [resolved]);

  const setTheme = useCallback((next: ThemePreference) => {
    setPreference(next);
    persist(next);
  }, []);

  const cycleTheme = useCallback(() => {
    setTheme(ORDER[(ORDER.indexOf(preference) + 1) % ORDER.length]);
  }, [preference, setTheme]);

  return { preference, resolved, setTheme, cycleTheme };
}
