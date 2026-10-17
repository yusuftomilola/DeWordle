"use client";

import type { ReactNode } from "react";
import { useVisualSettings } from "@/hooks/useVisualSettings";
import { ZoomContainer, ZoomControls } from "./ZoomControls";

/** Owns the persisted zoom level; scales page content and shows the controls. */
export function ZoomRoot({ children }: { children: ReactNode }) {
  const { settings, updateSetting } = useVisualSettings();
  return (
    <>
      <div className="fixed bottom-4 right-4 z-40 rounded-lg bg-dark-100/60 px-3 py-1 backdrop-blur">
        <ZoomControls zoom={settings.zoom} onZoomChange={(z) => updateSetting("zoom", z)} />
      </div>
      <ZoomContainer zoom={settings.zoom}>{children}</ZoomContainer>
    </>
  );
}
