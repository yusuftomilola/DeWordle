"use client";

import { useCallback, useState } from "react";
import { useSessionSync } from "@/hooks/useSessionSync";
import type { SyncedSessionState } from "@/lib/session-sync";
import { SyncStatusIndicator } from "./SyncStatusIndicator";

const SESSION_KEY = "dewordle_offline_session";

function readLocal(): SyncedSessionState | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw);
    if (!s || s.status !== "active" || !Array.isArray(s.guesses)) return null;
    return { sessionId: s.sessionId, guesses: s.guesses, updatedAt: Date.parse(s.startedAt) || 0 };
  } catch {
    return null;
  }
}

export function HeaderSyncStatus({ enabled }: { enabled: boolean }) {
  const [local, setLocal] = useState<SyncedSessionState | null>(() =>
    typeof window === "undefined" ? null : readLocal(),
  );
  const onRemoteState = useCallback((state: SyncedSessionState) => {
    setLocal(state);
    try {
      const prev = JSON.parse(localStorage.getItem(SESSION_KEY) ?? "{}");
      localStorage.setItem(
        SESSION_KEY,
        JSON.stringify({ ...prev, sessionId: state.sessionId, guesses: state.guesses, status: "active" }),
      );
    } catch {
      // storage unavailable
    }
  }, []);
  const { status } = useSessionSync({ local, onRemoteState, enabled });
  if (!enabled) return null;
  return <SyncStatusIndicator status={status} />;
}
