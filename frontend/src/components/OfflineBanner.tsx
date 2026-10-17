"use client";

interface OfflineBannerProps {
  isOnline: boolean;
  pendingSyncCount?: number;
}

export function OfflineBanner({ isOnline, pendingSyncCount = 0 }: OfflineBannerProps) {
  if (isOnline && pendingSyncCount === 0) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-black"
    >
      {isOnline
        ? `Back online — syncing ${pendingSyncCount} game${pendingSyncCount === 1 ? "" : "s"}…`
        : "You're offline. You can keep playing; results will sync when you reconnect."}
    </div>
  );
}
