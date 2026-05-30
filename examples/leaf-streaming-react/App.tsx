import { memo, useMemo } from "react";
import { createLeafStreamStore } from "../../packages/leaf-stream-store/src/index.js";
import { useLeafStreamSnapshot } from "../../packages/leaf-stream-store/src/react.js";

const streamStore = createLeafStreamStore();

export function ExampleCanvasPanel() {
  const rows = useMemo(() => ["intro", "answer-live", "summary"], []);
  return (
    <section aria-label="AI panel">
      {rows.map(rowId => (
        <MessageRow key={rowId} streamId={rowId} />
      ))}
      <button type="button" onClick={() => simulateTokens("answer-live")}>Simulate stream</button>
    </section>
  );
}

const MessageRow = memo(function MessageRow({ streamId }: { streamId: string }) {
  return streamId === "answer-live" ? <LiveStreamingLeaf streamId={streamId} /> : <StableHistoricalRow streamId={streamId} />;
});

function LiveStreamingLeaf({ streamId }: { streamId: string }) {
  const snapshot = useLeafStreamSnapshot(streamStore, streamId);
  return <article aria-busy={snapshot.status === "streaming"}>{snapshot.text || "Waiting for model..."}</article>;
}

const StableHistoricalRow = memo(function StableHistoricalRow({ streamId }: { streamId: string }) {
  return <article>Stable row: {streamId}</article>;
});

export async function simulateTokens(streamId: string) {
  streamStore.begin(streamId);
  for (const token of ["Leaf ", "streaming ", "keeps ", "canvas ", "calm."]) {
    streamStore.append(streamId, token);
    await new Promise(resolve => setTimeout(resolve, 20));
  }
  streamStore.complete(streamId);
}
