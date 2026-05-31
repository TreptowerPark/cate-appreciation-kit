export type SpatialNavAction =
  | 'previousByTime'
  | 'nextByTime'
  | 'previousBySpace'
  | 'nextBySpace'
  | 'navigateUp'
  | 'navigateDown'
  | 'navigateLeft'
  | 'navigateRight'
  | 'overviewPreviousCluster'
  | 'overviewNextCluster'
  | 'focusAndReveal'
  | 'zoomToOverview';

export interface SpatialNodeLike {
  id: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  /** Higher means newer. If absent, array order is used. */
  time?: number;
}

export type Direction = 'left' | 'right' | 'up' | 'down';

export function createWasdSpatialKeymap(): Record<string, SpatialNavAction> {
  return {
    w: 'previousByTime',
    s: 'nextByTime',
    a: 'previousBySpace',
    d: 'nextBySpace',
    ArrowUp: 'navigateUp',
    ArrowDown: 'navigateDown',
    ArrowLeft: 'navigateLeft',
    ArrowRight: 'navigateRight',
    'shift+w': 'overviewPreviousCluster',
    'shift+s': 'overviewNextCluster',
    Enter: 'focusAndReveal',
    Escape: 'zoomToOverview',
  };
}

export function chooseNextByTime(
  nodes: SpatialNodeLike[],
  currentId: string | null,
  direction: 'previous' | 'next',
): SpatialNodeLike | null {
  if (nodes.length === 0) return null;
  const sorted = nodes
    .map((node, index) => ({ node, index }))
    .sort((a, b) => (a.node.time ?? a.index) - (b.node.time ?? b.index));
  const currentIndex = currentId ? sorted.findIndex((entry) => entry.node.id === currentId) : -1;
  if (currentIndex === -1) {
    return direction === 'next' ? sorted[0].node : sorted[sorted.length - 1].node;
  }
  const delta = direction === 'next' ? 1 : -1;
  const nextIndex = (currentIndex + delta + sorted.length) % sorted.length;
  return sorted[nextIndex].node;
}

export function chooseNextByDirection(
  nodes: SpatialNodeLike[],
  currentId: string | null,
  direction: Direction,
): SpatialNodeLike | null {
  if (nodes.length === 0) return null;
  const current = currentId ? nodes.find((node) => node.id === currentId) ?? null : null;
  if (!current) return chooseNextByReadingOrder(nodes, null, 'next');

  const ref = centerOf(current);
  let best: SpatialNodeLike | null = null;
  let bestScore = Infinity;

  for (const node of nodes) {
    if (node.id === current.id) continue;
    const candidate = centerOf(node);
    const dx = candidate.x - ref.x;
    const dy = candidate.y - ref.y;
    const adx = Math.abs(dx);
    const ady = Math.abs(dy);
    let inCone = false;
    let score = Infinity;

    if (direction === 'left') { inCone = dx < 0 && adx >= ady; score = adx + 2 * ady; }
    else if (direction === 'right') { inCone = dx > 0 && adx >= ady; score = adx + 2 * ady; }
    else if (direction === 'up') { inCone = dy < 0 && ady >= adx; score = ady + 2 * adx; }
    else { inCone = dy > 0 && ady >= adx; score = ady + 2 * adx; }

    if (inCone && score < bestScore) {
      best = node;
      bestScore = score;
    }
  }

  return best;
}

export function chooseNextByReadingOrder(
  nodes: SpatialNodeLike[],
  currentId: string | null,
  direction: 'previous' | 'next',
): SpatialNodeLike | null {
  if (nodes.length === 0) return null;
  const sorted = [...nodes].sort((a, b) => (a.y - b.y) || (a.x - b.x));
  const currentIndex = currentId ? sorted.findIndex((node) => node.id === currentId) : -1;
  if (currentIndex === -1) return direction === 'next' ? sorted[0] : sorted[sorted.length - 1];
  const delta = direction === 'next' ? 1 : -1;
  return sorted[(currentIndex + delta + sorted.length) % sorted.length];
}

export function chooseNextBySpace(
  nodes: SpatialNodeLike[],
  currentId: string | null,
  direction: 'previous' | 'next',
): SpatialNodeLike | null {
  return chooseNextByReadingOrder(nodes, currentId, direction);
}

function centerOf(node: SpatialNodeLike): { x: number; y: number } {
  return {
    x: node.x + (node.width ?? 0) / 2,
    y: node.y + (node.height ?? 0) / 2,
  };
}
