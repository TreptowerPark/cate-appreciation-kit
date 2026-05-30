# Canvas IDE performance checklist

Use profiling before guessing.

## Token streaming

- Avoid parent-tree rerenders during token streaming.
- Isolate live streaming row from historical rows.
- Memoize stable rows.
- Batch very fast token streams to animation frames or small intervals.
- Avoid reparsing full markdown on every token when possible.

## DOM and layout

- Avoid too much mounted DOM.
- Consider virtualization for long lists or far-away panels.
- Consider `content-visibility: auto` for offscreen or below-fold content.
- Avoid layout thrash from measuring during every token.
- Keep resize observers bounded and debounced.

## Canvas and pixels

- Track viewport size, device pixel ratio, and pixel budget.
- Avoid rendering huge offscreen surfaces at full DPR.
- Clamp zoom and texture sizes.
- Prefer dirty-region updates when possible.

## Heavy surfaces

Be careful when combining:

- canvas rendering
- Electron webviews
- Monaco/editor surfaces
- terminals
- browser previews
- animated overlays
- markdown/code highlighting

Each subsystem may be fine alone and expensive together.

## Profiling prompts

Ask:

- What rerenders per token?
- Which component owns live text?
- How many nodes are mounted?
- What paints during pan/zoom?
- Are webviews/editors being recreated?
- Does memory grow after panels close?
