import type { Viewport } from './navigationBallistics.js';

export interface Point {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CanvasInsets {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

export const zeroInsets: CanvasInsets = Object.freeze({ left: 0, right: 0, top: 0, bottom: 0 });

export function computeSafeViewportRect(container: Size, insets: Partial<CanvasInsets> = {}): Rect {
  const left = insets.left ?? 0;
  const right = insets.right ?? 0;
  const top = insets.top ?? 0;
  const bottom = insets.bottom ?? 0;
  return {
    x: left,
    y: top,
    width: Math.max(0, container.width - left - right),
    height: Math.max(0, container.height - top - bottom),
  };
}

export function canvasRectToView(rect: Rect, viewport: Viewport): Rect {
  return {
    x: rect.x * viewport.zoom + viewport.x,
    y: rect.y * viewport.zoom + viewport.y,
    width: rect.width * viewport.zoom,
    height: rect.height * viewport.zoom,
  };
}

export function visibleAreaRatio(viewRect: Rect, safeRect: Rect): number {
  const ix = Math.max(viewRect.x, safeRect.x);
  const iy = Math.max(viewRect.y, safeRect.y);
  const ax = Math.min(viewRect.x + viewRect.width, safeRect.x + safeRect.width);
  const ay = Math.min(viewRect.y + viewRect.height, safeRect.y + safeRect.height);
  const intersection = Math.max(0, ax - ix) * Math.max(0, ay - iy);
  const area = Math.max(1, viewRect.width * viewRect.height);
  return intersection / area;
}

export function centerNodeInSafeArea(
  nodeBounds: Rect,
  currentViewport: Viewport,
  container: Size,
  insets: Partial<CanvasInsets> = {},
  zoom = currentViewport.zoom,
): Viewport {
  const safe = computeSafeViewportRect(container, insets);
  const nodeCenterX = nodeBounds.x + nodeBounds.width / 2;
  const nodeCenterY = nodeBounds.y + nodeBounds.height / 2;
  return {
    x: safe.x + safe.width / 2 - nodeCenterX * zoom,
    y: safe.y + safe.height / 2 - nodeCenterY * zoom,
    zoom,
  };
}

export interface FitBoundsOptions {
  padding?: number;
  minZoom?: number;
  maxZoom?: number;
}

export function fitBoundsInSafeArea(
  bounds: Rect,
  container: Size,
  insets: Partial<CanvasInsets> = {},
  options: FitBoundsOptions = {},
): Viewport {
  const safe = computeSafeViewportRect(container, insets);
  const padding = options.padding ?? 60;
  const minZoom = options.minZoom ?? 0.05;
  const maxZoom = options.maxZoom ?? 2;
  const contentWidth = Math.max(1, bounds.width + padding * 2);
  const contentHeight = Math.max(1, bounds.height + padding * 2);
  const zoom = Math.min(maxZoom, Math.max(minZoom, Math.min(safe.width / contentWidth, safe.height / contentHeight)));
  return {
    x: safe.x + (safe.width - contentWidth * zoom) / 2 - (bounds.x - padding) * zoom,
    y: safe.y + (safe.height - contentHeight * zoom) / 2 - (bounds.y - padding) * zoom,
    zoom,
  };
}

export function unionRects(rects: Rect[]): Rect | null {
  if (rects.length === 0) return null;
  const minX = Math.min(...rects.map((r) => r.x));
  const minY = Math.min(...rects.map((r) => r.y));
  const maxX = Math.max(...rects.map((r) => r.x + r.width));
  const maxY = Math.max(...rects.map((r) => r.y + r.height));
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}
