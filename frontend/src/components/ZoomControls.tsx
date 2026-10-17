"use client";

import { useEffect, type ReactNode } from "react";
import { ZOOM_MAX, ZOOM_MIN, stepZoom } from "@/lib/zoom";

interface ZoomControlsProps {
  zoom: number;
  onZoomChange: (zoom: number) => void;
}

/** −/+ buttons plus Ctrl/Cmd and `=` / `-` keyboard shortcuts. */
export function ZoomControls({ zoom, onZoomChange }: ZoomControlsProps) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      if (e.key === "=" || e.key === "+") {
        e.preventDefault();
        onZoomChange(stepZoom(zoom, 1));
      } else if (e.key === "-") {
        e.preventDefault();
        onZoomChange(stepZoom(zoom, -1));
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [zoom, onZoomChange]);

  return (
    <div role="group" aria-label="Zoom" className="flex items-center gap-2 text-white">
      <button
        type="button"
        aria-label="Zoom out"
        disabled={zoom <= ZOOM_MIN}
        onClick={() => onZoomChange(stepZoom(zoom, -1))}
        className="px-2 disabled:opacity-40"
      >
        −
      </button>
      <span aria-live="polite" data-testid="zoom-level">{zoom}%</span>
      <button
        type="button"
        aria-label="Zoom in"
        disabled={zoom >= ZOOM_MAX}
        onClick={() => onZoomChange(stepZoom(zoom, 1))}
        className="px-2 disabled:opacity-40"
      >
        +
      </button>
    </div>
  );
}

export function ZoomContainer({ zoom, children }: { zoom: number; children: ReactNode }) {
  return (
    <div
      data-testid="zoom-container"
      style={{
        transform: `scale(${zoom / 100})`,
        transformOrigin: "top center",
        width: `${10000 / zoom}%`,
        marginInline: "auto",
      }}
    >
      {children}
    </div>
  );
}
