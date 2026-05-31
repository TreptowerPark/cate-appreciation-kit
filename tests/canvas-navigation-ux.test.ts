import { describe, expect, it } from 'vitest';
import {
  classifyWheelIntent,
  computeFocusViewport,
  centerNodeInSafeArea,
  chooseNextByDirection,
  chooseNextByTime,
  createWasdSpatialKeymap,
  interpolateViewport,
  reducedMotionBallistics,
} from '../packages/canvas-navigation-ux/src/index.js';

describe('canvas navigation UX policy', () => {
  it('ignores small horizontal residue during vertical panel scroll', () => {
    const intent = classifyWheelIntent(
      { deltaX: 3, deltaY: 90 },
      { insidePanel: true, panelCanScrollX: false, panelCanScrollY: true, onCanvasSurface: false },
    );
    expect(intent.type).toBe('ignoreHorizontalResidue');
  });

  it('keeps wheel ownership inside a focused scrollable panel', () => {
    const intent = classifyWheelIntent(
      { deltaX: 0, deltaY: 48 },
      { insidePanel: true, panelCanScrollX: false, panelCanScrollY: true, onCanvasSurface: false },
    );
    expect(intent.type).toBe('panelScroll');
  });

  it('treats Cmd/Ctrl wheel as explicit zoom', () => {
    const intent = classifyWheelIntent(
      { deltaX: 0, deltaY: -10, ctrlKey: true },
      { insidePanel: true, panelCanScrollX: true, panelCanScrollY: true, onCanvasSurface: false },
    );
    expect(intent.type).toBe('explicitZoom');
  });

  it('does not move camera when focused node is already visible enough', () => {
    const decision = computeFocusViewport(
      { x: 100, y: 100, width: 300, height: 200 },
      { x: 0, y: 0, zoom: 1 },
      { width: 1000, height: 800 },
      'click',
    );
    expect(decision.shouldMove).toBe(false);
  });

  it('centers a node in the sidebar-safe area', () => {
    const viewport = centerNodeInSafeArea(
      { x: 1000, y: 200, width: 400, height: 300 },
      { x: 0, y: 0, zoom: 1 },
      { width: 1200, height: 800 },
      { left: 240 },
    );
    // Safe area center is (720, 400). Node center is (1200, 350).
    expect(viewport.x).toBe(-480);
    expect(viewport.y).toBe(50);
  });

  it('chooses temporal previous and next', () => {
    const nodes = [
      { id: 'a', x: 0, y: 0, time: 1 },
      { id: 'b', x: 0, y: 0, time: 2 },
      { id: 'c', x: 0, y: 0, time: 3 },
    ];
    expect(chooseNextByTime(nodes, 'b', 'previous')?.id).toBe('a');
    expect(chooseNextByTime(nodes, 'b', 'next')?.id).toBe('c');
  });

  it('chooses directional spatial neighbors', () => {
    const nodes = [
      { id: 'left', x: 0, y: 100, width: 100, height: 100 },
      { id: 'center', x: 200, y: 100, width: 100, height: 100 },
      { id: 'right', x: 400, y: 100, width: 100, height: 100 },
      { id: 'down', x: 200, y: 320, width: 100, height: 100 },
    ];
    expect(chooseNextByDirection(nodes, 'center', 'left')?.id).toBe('left');
    expect(chooseNextByDirection(nodes, 'center', 'right')?.id).toBe('right');
    expect(chooseNextByDirection(nodes, 'center', 'down')?.id).toBe('down');
  });

  it('uses immediate interpolation for reduced motion', () => {
    const next = interpolateViewport(
      { x: 0, y: 0, zoom: 1 },
      { x: 100, y: 200, zoom: 1.5 },
      0.1,
      reducedMotionBallistics,
    );
    expect(next).toEqual({ x: 100, y: 200, zoom: 1.5 });
  });

  it('ships a WASD-style keymap', () => {
    const map = createWasdSpatialKeymap();
    expect(map.w).toBe('previousByTime');
    expect(map.s).toBe('nextByTime');
    expect(map.a).toBe('previousBySpace');
    expect(map.d).toBe('nextBySpace');
  });
});
