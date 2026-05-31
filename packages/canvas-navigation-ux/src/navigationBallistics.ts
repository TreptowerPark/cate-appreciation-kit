export interface Viewport {
  x: number;
  y: number;
  zoom: number;
}

export type NavigationIntent = 'focus' | 'zoom' | 'overview' | 'pan';
export type EasingFunction = (t: number) => number;

export interface NavigationBallistics {
  focusDurationMs: number;
  zoomDurationMs: number;
  overviewDurationMs: number;
  panDurationMs: number;
  easing: EasingFunction;
  reducedMotion?: boolean;
}

export const cubicOut: EasingFunction = (t: number) => 1 - Math.pow(1 - clamp01(t), 3);

export const cubicInOut: EasingFunction = (t: number) => {
  const p = clamp01(t);
  return p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
};

export const snappyBallistics: NavigationBallistics = {
  focusDurationMs: 120,
  zoomDurationMs: 100,
  overviewDurationMs: 160,
  panDurationMs: 100,
  easing: cubicOut,
};

export const smoothBallistics: NavigationBallistics = {
  focusDurationMs: 180,
  zoomDurationMs: 160,
  overviewDurationMs: 220,
  panDurationMs: 140,
  easing: cubicInOut,
};

export const reducedMotionBallistics: NavigationBallistics = {
  focusDurationMs: 0,
  zoomDurationMs: 0,
  overviewDurationMs: 0,
  panDurationMs: 0,
  easing: () => 1,
  reducedMotion: true,
};

export function durationForIntent(intent: NavigationIntent, ballistics: NavigationBallistics = snappyBallistics): number {
  if (ballistics.reducedMotion) return 0;
  switch (intent) {
    case 'focus': return ballistics.focusDurationMs;
    case 'zoom': return ballistics.zoomDurationMs;
    case 'overview': return ballistics.overviewDurationMs;
    case 'pan': return ballistics.panDurationMs;
  }
}

export function interpolateViewport(
  from: Viewport,
  to: Viewport,
  progress: number,
  ballistics: NavigationBallistics = snappyBallistics,
): Viewport {
  const t = ballistics.reducedMotion ? 1 : ballistics.easing(clamp01(progress));
  return {
    x: lerp(from.x, to.x, t),
    y: lerp(from.y, to.y, t),
    zoom: lerp(from.zoom, to.zoom, t),
  };
}

export function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}
