export interface SyncedSessionState {
  sessionId: string;
  guesses: string[];
  /** Epoch ms of the most recent guess submission; used for conflict detection. */
  updatedAt: number;
}

export type SyncStatus = "idle" | "syncing" | "synced" | "retrying";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

/** Last-write-wins on the most recent guess submission; ties keep the local copy. */
export function resolveConflict(
  local: SyncedSessionState | null,
  remote: SyncedSessionState | null,
): SyncedSessionState | null {
  if (!local) return remote;
  if (!remote) return local;
  return remote.updatedAt > local.updatedAt ? remote : local;
}

export interface SyncClientOptions {
  fetchImpl?: typeof fetch;
  apiBase?: string;
  headers?: Record<string, string>;
}

export async function pushSessionState(
  state: SyncedSessionState,
  { fetchImpl = fetch, apiBase = API_BASE, headers }: SyncClientOptions = {},
): Promise<void> {
  const res = await fetchImpl(`${apiBase}/api/v1/sessions/${encodeURIComponent(state.sessionId)}/state`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify({ guesses: state.guesses, updatedAt: state.updatedAt }),
  });
  if (!res.ok) throw new Error(`Session sync failed with status ${res.status}`);
}

export async function fetchActiveSession({
  fetchImpl = fetch,
  apiBase = API_BASE,
  headers,
}: SyncClientOptions = {}): Promise<SyncedSessionState | null> {
  const res = await fetchImpl(`${apiBase}/api/v1/sessions/active`, { headers });
  if (res.status === 404 || res.status === 204) return null;
  if (!res.ok) throw new Error(`Active session fetch failed with status ${res.status}`);
  const body = (await res.json()) as Partial<SyncedSessionState> | null;
  if (
    !body ||
    typeof body.sessionId !== "string" ||
    !Array.isArray(body.guesses) ||
    typeof body.updatedAt !== "number"
  ) {
    return null;
  }
  return { sessionId: body.sessionId, guesses: body.guesses.map(String), updatedAt: body.updatedAt };
}
