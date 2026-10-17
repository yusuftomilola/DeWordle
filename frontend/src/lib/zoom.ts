export const ZOOM_MIN = 100;
export const ZOOM_MAX = 200;
export const ZOOM_STEP = 25;

export function clampZoom(value: number): number {
  if (!Number.isFinite(value)) return ZOOM_MIN;
  const snapped = Math.round(value / ZOOM_STEP) * ZOOM_STEP;
  return Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, snapped));
}

export function stepZoom(current: number, direction: 1 | -1): number {
  return clampZoom(current + direction * ZOOM_STEP);
}
