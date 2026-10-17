import React, { useEffect, useState } from "react";
import type { Decorator } from "@storybook/react";

/**
 * Renders a story in the theme chosen in the Storybook toolbar. The light
 * theme re-tints the translucent-white skeleton blocks, which would otherwise
 * disappear on a white canvas.
 */
export const withSkeletonTheme: Decorator = (Story, context) => {
  const theme = (context.globals.theme as "dark" | "light" | undefined) ?? "dark";
  return (
    <div
      data-theme={theme}
      className={
        theme === "light"
          ? "min-h-[200px] rounded-lg bg-white p-6 text-gray-900 [&_.animate-pulse]:bg-black/10 [&_[class*='border-white']]:border-black/10"
          : "min-h-[200px] rounded-lg bg-[#0a0118] p-6 text-white"
      }
    >
      <Story />
    </div>
  );
};

/**
 * Shows `skeleton`, then swaps to `content` after `delayMs`, so the
 * loading-to-loaded transition can be reviewed. "Replay" restarts it.
 */
export function SkeletonToContent({
  skeleton,
  content,
  delayMs = 2000,
}: {
  skeleton: React.ReactNode;
  content: React.ReactNode;
  delayMs?: number;
}) {
  const [loaded, setLoaded] = useState(false);
  const [run, setRun] = useState(0);

  useEffect(() => {
    setLoaded(false);
    const timer = setTimeout(() => setLoaded(true), delayMs);
    return () => clearTimeout(timer);
  }, [run, delayMs]);

  return (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        onClick={() => setRun((n) => n + 1)}
        className="self-start rounded-md border border-current px-3 py-1 text-xs"
      >
        Replay ({loaded ? "loaded" : "loading…"})
      </button>
      {loaded ? content : skeleton}
    </div>
  );
}
