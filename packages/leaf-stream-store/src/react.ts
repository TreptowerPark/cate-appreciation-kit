import { useSyncExternalStore } from "react";
import type { LeafStreamSnapshot, LeafStreamStore } from "./index.js";

/** React bridge for LeafStreamStore. Only subscribers for the given key update. */
export function useLeafStreamSnapshot<TMeta>(
  store: LeafStreamStore<TMeta>,
  key: string,
): LeafStreamSnapshot<TMeta> {
  return useSyncExternalStore(
    listener => store.subscribe(key, listener),
    () => store.getSnapshot(key),
    () => store.getSnapshot(key),
  );
}

export function useLeafStreamText<TMeta>(store: LeafStreamStore<TMeta>, key: string): string {
  return useLeafStreamSnapshot(store, key).text;
}

export function useLeafStreamStatus<TMeta>(store: LeafStreamStore<TMeta>, key: string): LeafStreamSnapshot<TMeta>["status"] {
  return useLeafStreamSnapshot(store, key).status;
}
