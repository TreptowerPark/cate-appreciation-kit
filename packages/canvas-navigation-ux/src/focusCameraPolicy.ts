import type { Viewport } from './navigationBallistics.js';
import {
  canvasRectToView,
  centerNodeInSafeArea,
  computeSafeViewportRect,
  visibleAreaRatio,
  type CanvasInsets,
  type Rect,
  type Size,
} from './safeAreaViewport.js';

export type FocusReason = 'click' | 'keyboard' | 'programmatic' | 'textEntry';

export interface FocusCameraOptions {
  minVisibleRatio?: number;
  readableZoom?: number;
  minZoom?: number;
  maxZoom?: number;
  safeInsets?: Partial<CanvasInsets>;
  followOnClick?: boolean;
  followOnKeyboard?: boolean;
  followOnProgrammatic?: boolean;
  userIsManipulating?: boolean;
}

export interface FocusViewportDecision {
  shouldMove: boolean;
  viewport: Viewport;
  visibleRatio: number;
  reason: string;
}

export function shouldCameraFollowFocus(
  visibleRatio: number,
  reason: FocusReason,
  options: FocusCameraOptions = {},
): boolean {
  if (options.userIsManipulating) return false;
  if (reason === 'textEntry') return false;
  if (reason === 'click' && options.followOnClick === false) return false;
  if (reason === 'keyboard' && options.followOnKeyboard === false) return false;
  if (reason === 'programmatic' && options.followOnProgrammatic !== true) return false;
  return visibleRatio < (options.minVisibleRatio ?? 0.6);
}

export function computeFocusViewport(
  nodeBounds: Rect,
  currentViewport: Viewport,
  container: Size,
  reason: FocusReason,
  options: FocusCameraOptions = {},
): FocusViewportDecision {
  const safe = computeSafeViewportRect(container, options.safeInsets);
  const viewRect = canvasRectToView(nodeBounds, currentViewport);
  const visibleRatio = visibleAreaRatio(viewRect, safe);

  if (!shouldCameraFollowFocus(visibleRatio, reason, options)) {
    return {
      shouldMove: false,
      viewport: currentViewport,
      visibleRatio,
      reason: options.userIsManipulating ? 'user is manipulating canvas or node' : 'target already visible enough',
    };
  }

  const readableZoom = options.readableZoom ?? currentViewport.zoom;
  const maxZoom = options.maxZoom ?? 1.5;
  const minZoom = options.minZoom ?? 0.05;
  const targetZoom = Math.min(maxZoom, Math.max(minZoom, Math.max(currentViewport.zoom, readableZoom)));
  return {
    shouldMove: true,
    viewport: centerNodeInSafeArea(nodeBounds, currentViewport, container, options.safeInsets, targetZoom),
    visibleRatio,
    reason: 'target is outside the readable safe area',
  };
}

export function computeRevealViewport(
  nodeBounds: Rect,
  currentViewport: Viewport,
  container: Size,
  options: FocusCameraOptions = {},
): FocusViewportDecision {
  return computeFocusViewport(nodeBounds, currentViewport, container, 'keyboard', {
    ...options,
    followOnKeyboard: true,
  });
}
