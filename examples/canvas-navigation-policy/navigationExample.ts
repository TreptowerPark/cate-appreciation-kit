import {
  classifyWheelIntent,
  computeFocusViewport,
  createWasdSpatialKeymap,
  chooseNextByDirection,
  type Rect,
  type Viewport,
} from '../../packages/canvas-navigation-ux/src/index.js';

const currentViewport: Viewport = { x: 0, y: 0, zoom: 1 };
const container = { width: 1440, height: 900 };
const leftSidebarInset = { left: 280 };
const panelBounds: Rect = { x: 1200, y: 400, width: 600, height: 420 };

// 1. Wheel ownership: vertical panel scroll with tiny horizontal noise should
// not nudge the canvas sideways.
const wheelIntent = classifyWheelIntent(
  { deltaX: 3, deltaY: 80 },
  {
    insidePanel: true,
    panelCanScrollX: false,
    panelCanScrollY: true,
    onCanvasSurface: false,
  },
);

if (wheelIntent.type === 'ignoreHorizontalResidue' || wheelIntent.type === 'panelScroll') {
  // Let the panel scroll or ignore the side residue. Do not pan the canvas.
}

// 2. Focus reveal: a panel selected by keyboard should be centered inside the
// safe canvas area, not underneath the sidebar.
const focusDecision = computeFocusViewport(
  panelBounds,
  currentViewport,
  container,
  'keyboard',
  {
    safeInsets: leftSidebarInset,
    readableZoom: 1,
  },
);

if (focusDecision.shouldMove) {
  // hostCanvasStore.animateTo(focusDecision.viewport, snappyBallistics)
}

// 3. WASD traversal: W/S can mean time; A/D can mean spatial/reading order.
const keymap = createWasdSpatialKeymap();
const nodes = [
  { id: 'notes', x: 0, y: 0, width: 400, height: 300, time: 1 },
  { id: 'agent', x: 520, y: 0, width: 400, height: 300, time: 2 },
  { id: 'logs', x: 1040, y: 0, width: 400, height: 300, time: 3 },
];

const actionForD = keymap.d;
const nextRight = actionForD === 'nextBySpace'
  ? chooseNextByDirection(nodes, 'agent', 'right')
  : null;

console.log({ wheelIntent, focusDecision, nextRight });
