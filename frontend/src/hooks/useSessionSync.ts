"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  fetchActiveSession,
  pushSessionState,
  resolveConflict,
  type SyncClientOptions,
  type SyncStatus,
  type SyncedSessionState,
} from "@/lib/session-sync";

export const SYNC_POLL_INTERVAL_MS = 10_000;

interface UseSessionSyncOptions extends SyncClientOptions {
  local: SyncedSessionState | null;
  /** Called when the backend holds a newer state than this device. */
  onRemoteState: (state: SyncedSessionState) => void;
  intervalMs?: number;
  enabled?: boolean;
}

/**
 * Pushes the session on each guess and polls every 10s for changes made on
 * another device. Failures are retried on the next tick and never thrown.
 */
export function useSessionSync({
  local,
  onRemoteState,
  intervalMs = SYNC_POLL_INTERVAL_MS,
  enabled = true,
  fetchImpl,
  apiBase,
  headers,
}: UseSessionSyncOptions) {
  const [status, setStatus] = useState<SyncStatus>("idle");
  const [lastSyncedAt, setLastSyncedAt] = useState<number | null>(null);
  const localRef = useRef(local);
  const onRemoteRef = useRef(onRemoteState);
  const pushedAtRef = useRef<number | null>(null);
  localRef.current = local;
  onRemoteRef.current = onRemoteState;

  const client = { fetchImpl, apiBase, headers };

  const sync = useCallback(async () => {
    setStatus("syncing");
    try {
      const current = localRef.current;
      if (current && current.updatedAt !== pushedAtRef.current) {
        await pushSessionState(current, client);
        pushedAtRef.current = current.updatedAt;
      }
      const remote = await fetchActiveSession(client);
      const winner = resolveConflict(localRef.current, remote);
      if (winner && winner === remote && winner !== localRef.current) {
        pushedAtRef.current = winner.updatedAt;
        onRemoteRef.current(winner);
      }
      setLastSyncedAt(Date.now());
      setStatus("synced");
    } catch {
      setStatus("retrying");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchImpl, apiBase, headers]);

  useEffect(() => {
    if (!enabled) return;
    void sync();
    const timer = window.setInterval(() => void sync(), intervalMs);
    return () => window.clearInterval(timer);
  }, [enabled, intervalMs, sync]);

  const updatedAt = local?.updatedAt;
  useEffect(() => {
    if (enabled && updatedAt !== undefined) void sync();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updatedAt]);

  return { status, lastSyncedAt };
}
