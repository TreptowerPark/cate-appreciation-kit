export interface WheelLikeInput {
  deltaX: number;
  deltaY: number;
  deltaMode?: number;
  metaKey?: boolean;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
}

export interface WheelIntentContext {
  /** True when the wheel event originated inside a panel/window/node body. */
  insidePanel: boolean;
  /** True when the local panel surface can scroll horizontally in the gesture path. */
  panelCanScrollX: boolean;
  /** True when the local panel surface can scroll vertically in the gesture path. */
  panelCanScrollY: boolean;
  /** True when the pointer is on the bare canvas surface, not over panel content. */
  onCanvasSurface: boolean;
  /** Host apps may set this from Shift, Space-hold, hand-tool, or another explicit pan affordance. */
  explicitPanModifier?: boolean;
  /** Optional hint supplied by the host's wheel classifier. */
  physicalMouseWheel?: boolean;
}

export interface WheelIntentOptions {
  /** Small horizontal noise from tilt wheels or touch hardware. */
  horizontalResiduePx?: number;
  /** Axis ratio required before vertical/horizontal dominance is trusted. */
  axisDominanceRatio?: number;
  /** Do not convert panel wheel events into canvas pan unless an explicit modifier says so. */
  requireModifierForCanvasPanInsidePanel?: boolean;
  /** Do not pan unless the event started on bare canvas or an explicit pan modifier is active. */
  requirePanSurface?: boolean;
}

export type WheelIntent =
  | { type: 'explicitZoom'; dx: number; dy: number }
  | { type: 'panelScroll'; dx: number; dy: number }
  | { type: 'canvasPan'; dx: number; dy: number }
  | { type: 'ignoreHorizontalResidue'; dx: number; dy: number; keptDeltaY: number }
  | { type: 'ignoreInsidePanel'; dx: number; dy: number; reason: string };

export interface AxisIntent {
  primaryAxis: 'x' | 'y' | 'none';
  horizontalResidue: boolean;
  verticalDominates: boolean;
  horizontalDominates: boolean;
}

export function classifyWheelAxis(
  e: Pick<WheelLikeInput, 'deltaX' | 'deltaY'>,
  options: WheelIntentOptions = {},
): AxisIntent {
  const horizontalResiduePx = options.horizontalResiduePx ?? 6;
  const axisDominanceRatio = options.axisDominanceRatio ?? 1.35;
  const ax = Math.abs(e.deltaX);
  const ay = Math.abs(e.deltaY);

  if (ax === 0 && ay === 0) {
    return {
      primaryAxis: 'none',
      horizontalResidue: false,
      verticalDominates: false,
      horizontalDominates: false,
    };
  }

  const verticalDominates = ay > ax * axisDominanceRatio;
  const horizontalDominates = ax > ay * axisDominanceRatio;
  return {
    primaryAxis: horizontalDominates ? 'x' : 'y',
    horizontalResidue: ax > 0 && ax <= horizontalResiduePx && verticalDominates,
    verticalDominates,
    horizontalDominates,
  };
}

/**
 * Decide who should own a wheel event on a dense information canvas.
 *
 * Policy: explicit zoom wins; panel-local scroll wins inside panels; canvas pan
 * only wins on the canvas surface or behind an explicit pan affordance. This
 * prevents tiny horizontal wheel residue from nudging the whole world while the
 * user is reading or scrolling inside a panel.
 */
export function classifyWheelIntent(
  e: WheelLikeInput,
  context: WheelIntentContext,
  options: WheelIntentOptions = {},
): WheelIntent {
  const dx = e.deltaX;
  const dy = e.deltaY;

  if (e.metaKey || e.ctrlKey) {
    return { type: 'explicitZoom', dx, dy };
  }

  const axis = classifyWheelAxis(e, options);
  const explicitPan = context.explicitPanModifier ?? e.shiftKey ?? false;
  const requireModifierInsidePanel = options.requireModifierForCanvasPanInsidePanel ?? true;
  const requirePanSurface = options.requirePanSurface ?? true;

  if (context.insidePanel) {
    if (axis.horizontalResidue && context.panelCanScrollY) {
      return { type: 'ignoreHorizontalResidue', dx, dy, keptDeltaY: dy };
    }

    const wantsHorizontal = axis.primaryAxis === 'x';
    const panelCanOwn = wantsHorizontal ? context.panelCanScrollX : context.panelCanScrollY;
    if (panelCanOwn) {
      return { type: 'panelScroll', dx, dy };
    }

    if (requireModifierInsidePanel && !explicitPan) {
      return {
        type: 'ignoreInsidePanel',
        dx,
        dy,
        reason: 'panel-first wheel policy: no explicit canvas-pan modifier',
      };
    }
  }

  if (axis.horizontalResidue) {
    return { type: 'ignoreHorizontalResidue', dx, dy, keptDeltaY: dy };
  }

  if (requirePanSurface && !context.onCanvasSurface && !explicitPan) {
    return {
      type: 'ignoreInsidePanel',
      dx,
      dy,
      reason: 'wheel did not start on a canvas pan surface',
    };
  }

  return { type: 'canvasPan', dx, dy };
}
