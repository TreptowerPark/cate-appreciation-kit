# Leaf-level streaming state

AI token streams are high-frequency updates. In a canvas IDE, one token stream may coexist with editors, terminals, browsers, inspectors, sidebars, and many historical chat rows.

If each token updates parent React state, the whole panel tree can rerender dozens of times per second. That is often the wrong cost center.

## Pattern

Use a small external store keyed by `streamId`, `panelId`, or `conversationId`.

- Historical rows read stable data and stay memoized.
- Live row subscribes to one key.
- Token append updates only that key’s listeners.
- React consumes snapshots through `useSyncExternalStore`.
- Non-React code can use the same store through `subscribe`.

## Why this helps canvas IDEs

Canvas IDEs often have expensive siblings: webviews, editors, terminals, minimaps, preview panes, and nested panels. Token streaming should not invalidate those siblings.

## Minimal flow

```ts
const store = createLeafStreamStore();
store.begin("conversation-1");
store.append("conversation-1", "hello ");
store.append("conversation-1", "world");
store.complete("conversation-1");
```

In React:

```tsx
const snapshot = useLeafStreamSnapshot(store, streamId);
return <article aria-busy={snapshot.status === "streaming"}>{snapshot.text}</article>;
```

## Notes

- Keep stream snapshots immutable.
- Avoid passing fresh objects through parent props on every token.
- Keep markdown parsing/rendering out of the hot path when possible.
- Batch tokens if model/provider emits faster than the UI needs.
- Profile before and after. Do not guess.
