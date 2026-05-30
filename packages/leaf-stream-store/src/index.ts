export type StreamStatus = "idle" | "streaming" | "complete" | "error";

export interface LeafStreamSnapshot<TMeta = unknown> {
  key: string;
  text: string;
  status: StreamStatus;
  version: number;
  updatedAt: number;
  meta?: TMeta;
  error?: string;
}

export type LeafStreamListener = () => void;

export interface LeafStreamStoreOptions<TMeta = unknown> {
  now?: () => number;
  initialMeta?: TMeta;
}

const EMPTY_SNAPSHOT: LeafStreamSnapshot = Object.freeze({
  key: "",
  text: "",
  status: "idle",
  version: 0,
  updatedAt: 0,
});

/**
 * Tiny key-addressed stream store.
 *
 * Canvas IDEs often render many panels, rows, or cards. During AI token streaming,
 * updating app-level state can rerender the entire tree. This store lets only the
 * leaf subscribed to a specific streamId/panelId/conversationId rerender.
 */
export class LeafStreamStore<TMeta = unknown> {
  private readonly snapshots = new Map<string, LeafStreamSnapshot<TMeta>>();
  private readonly listenersByKey = new Map<string, Set<LeafStreamListener>>();
  private readonly allListeners = new Set<LeafStreamListener>();
  private readonly now: () => number;
  private readonly initialMeta?: TMeta;

  constructor(options: LeafStreamStoreOptions<TMeta> = {}) {
    this.now = options.now ?? Date.now;
    this.initialMeta = options.initialMeta;
  }

  getSnapshot(key: string): LeafStreamSnapshot<TMeta> {
    return this.snapshots.get(key) ?? ({ ...EMPTY_SNAPSHOT, key, meta: this.initialMeta } as LeafStreamSnapshot<TMeta>);
  }

  getAllSnapshots(): LeafStreamSnapshot<TMeta>[] {
    return Array.from(this.snapshots.values());
  }

  subscribe(key: string, listener: LeafStreamListener): () => void {
    let listeners = this.listenersByKey.get(key);
    if (!listeners) {
      listeners = new Set();
      this.listenersByKey.set(key, listeners);
    }
    listeners.add(listener);
    return () => {
      listeners?.delete(listener);
      if (listeners?.size === 0) this.listenersByKey.delete(key);
    };
  }

  subscribeAll(listener: LeafStreamListener): () => void {
    this.allListeners.add(listener);
    return () => this.allListeners.delete(listener);
  }

  begin(key: string, meta?: TMeta): LeafStreamSnapshot<TMeta> {
    return this.write(key, previous => ({
      key,
      text: previous?.text ?? "",
      status: "streaming",
      version: (previous?.version ?? 0) + 1,
      updatedAt: this.now(),
      meta: meta ?? previous?.meta ?? this.initialMeta,
    }));
  }

  append(key: string, chunk: string, meta?: TMeta): LeafStreamSnapshot<TMeta> {
    return this.write(key, previous => ({
      key,
      text: `${previous?.text ?? ""}${chunk}`,
      status: "streaming",
      version: (previous?.version ?? 0) + 1,
      updatedAt: this.now(),
      meta: meta ?? previous?.meta ?? this.initialMeta,
    }));
  }

  setText(key: string, text: string, status: StreamStatus = "streaming", meta?: TMeta): LeafStreamSnapshot<TMeta> {
    return this.write(key, previous => ({
      key,
      text,
      status,
      version: (previous?.version ?? 0) + 1,
      updatedAt: this.now(),
      meta: meta ?? previous?.meta ?? this.initialMeta,
    }));
  }

  complete(key: string, meta?: TMeta): LeafStreamSnapshot<TMeta> {
    return this.write(key, previous => ({
      key,
      text: previous?.text ?? "",
      status: "complete",
      version: (previous?.version ?? 0) + 1,
      updatedAt: this.now(),
      meta: meta ?? previous?.meta ?? this.initialMeta,
    }));
  }

  fail(key: string, error: string, meta?: TMeta): LeafStreamSnapshot<TMeta> {
    return this.write(key, previous => ({
      key,
      text: previous?.text ?? "",
      status: "error",
      version: (previous?.version ?? 0) + 1,
      updatedAt: this.now(),
      meta: meta ?? previous?.meta ?? this.initialMeta,
      error,
    }));
  }

  reset(key: string): void {
    this.snapshots.delete(key);
    this.emit(key);
  }

  clear(): void {
    const keys = Array.from(this.snapshots.keys());
    this.snapshots.clear();
    for (const key of keys) this.emit(key);
  }

  private write(key: string, build: (previous: LeafStreamSnapshot<TMeta> | undefined) => LeafStreamSnapshot<TMeta>): LeafStreamSnapshot<TMeta> {
    const next = Object.freeze(build(this.snapshots.get(key)));
    this.snapshots.set(key, next);
    this.emit(key);
    return next;
  }

  private emit(key: string): void {
    this.listenersByKey.get(key)?.forEach(listener => listener());
    this.allListeners.forEach(listener => listener());
  }
}

export function createLeafStreamStore<TMeta = unknown>(options?: LeafStreamStoreOptions<TMeta>): LeafStreamStore<TMeta> {
  return new LeafStreamStore<TMeta>(options);
}
