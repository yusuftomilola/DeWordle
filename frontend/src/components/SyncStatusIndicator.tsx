"use client";

import type { SyncStatus } from "@/lib/session-sync";

const LABEL: Record<SyncStatus, string> = {
  idle: "Sync idle",
  syncing: "Syncing…",
  synced: "Synced",
  retrying: "Sync paused, retrying",
};

const DOT: Record<SyncStatus, string> = {
  idle: "bg-gray-500",
  syncing: "bg-blue-400",
  synced: "bg-green-500",
  retrying: "bg-yellow-500",
};

export function SyncStatusIndicator({ status }: { status: SyncStatus }) {
  return (
    <span role="status" aria-label={LABEL[status]} data-status={status} className="inline-flex items-center gap-1 text-xs text-gray-300">
      <span aria-hidden="true" className={`h-2 w-2 rounded-full ${DOT[status]}`} />
      {LABEL[status]}
    </span>
  );
}
