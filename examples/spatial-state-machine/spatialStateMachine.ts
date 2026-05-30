export type Phase = "idle" | "inviting-input" | "exchanging" | "chat" | "spatial" | "focused";

export interface ViewportSnapshot {
  x: number;
  y: number;
  zoom: number;
}

export interface SpatialFocusState {
  phase: Phase;
  activePanelId?: string;
  savedViewport?: ViewportSnapshot;
  viewport: ViewportSnapshot;
}

export type SpatialEvent =
  | { type: "OPEN_SPATIAL" }
  | { type: "FOCUS_PANEL"; panelId: string }
  | { type: "RESTORE_OVERVIEW" }
  | { type: "USER_STARTED_INPUT" }
  | { type: "MODEL_STARTED" }
  | { type: "MODEL_FINISHED" };

export const initialSpatialFocusState: SpatialFocusState = {
  phase: "idle",
  viewport: { x: 0, y: 0, zoom: 1 },
};

export function reduceSpatialFocus(
  state: SpatialFocusState,
  event: SpatialEvent,
): SpatialFocusState {
  switch (event.type) {
    case "OPEN_SPATIAL":
      return { ...state, phase: "spatial", activePanelId: undefined };
    case "FOCUS_PANEL":
      return {
        ...state,
        phase: "focused",
        activePanelId: event.panelId,
        savedViewport: state.viewport,
        viewport: glideTowardPanel(event.panelId, state.viewport),
      };
    case "RESTORE_OVERVIEW":
      return {
        ...state,
        phase: "spatial",
        activePanelId: undefined,
        viewport: state.savedViewport ?? state.viewport,
        savedViewport: undefined,
      };
    case "USER_STARTED_INPUT":
      return { ...state, phase: "inviting-input" };
    case "MODEL_STARTED":
      return { ...state, phase: "exchanging" };
    case "MODEL_FINISHED":
      return { ...state, phase: state.activePanelId ? "chat" : "spatial" };
  }
}

function glideTowardPanel(panelId: string, viewport: ViewportSnapshot): ViewportSnapshot {
  // Placeholder: real apps know panel bounds. Keep transition short and reversible.
  const nudge = stableTinyHash(panelId) * 24;
  return { x: viewport.x + nudge, y: viewport.y + nudge, zoom: Math.max(viewport.zoom, 1.1) };
}

function stableTinyHash(value: string): number {
  return Array.from(value).reduce((sum, char) => sum + char.charCodeAt(0), 0) % 5;
}
