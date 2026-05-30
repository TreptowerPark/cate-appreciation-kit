# Cate Appreciation Kit

Hello Cate builders — this is a small token of appreciation from a neighboring spatial-AI-canvas experiment. We are not ready to open-source the whole Bon Courage/4dchat codebase, but we wanted to share a few patterns that may be useful: leaf-level streaming state, agent approval UX, spatial/focused mode notes, canvas performance checklists, and AI-output security vectors. Take what helps, ignore what does not. Bon courage.

Cate: <https://github.com/0-AI-UG/cate>

## What this repo is

A small, standalone, MIT-licensed bundle of clean-room notes and TypeScript examples for Cate-style canvas IDEs.

It includes:

- leaf-level AI streaming state
- agent tool approval protocol notes
- spatial overview ↔ focused reading/writing mode notes
- canvas IDE performance checklist
- AI/user-output security vectors

## What this repo is not

- Not a fork of Cate.
- Not a product release.
- Not a full app.
- Not a copy of any private source tree.
- Not agent execution internals.
- Not provider, auth, telemetry, or deployment code.

**This repository does not license or expose the 4dchat or Bon Courage codebase.**

## How it may help Cate

Cate already explores a spatial desktop IDE. These artifacts may help with adjacent problems:

- keeping token streaming cheap inside many mounted panels
- making risky agent tools clear and user-approved
- helping users move between overview and focused work without getting lost
- profiling heavy canvas/webview/editor/terminal surfaces
- testing AI-generated text before rendering it as HTML

## Quick map

| Path | Purpose |
| --- | --- |
| `packages/leaf-stream-store/src/index.ts` | framework-agnostic keyed stream store |
| `packages/leaf-stream-store/src/react.ts` | React `useSyncExternalStore` hooks |
| `docs/leaf-streaming-state.md` | why leaf-level streaming helps canvas UIs |
| `examples/leaf-streaming-react/` | tiny React example |
| `packages/tool-approval-protocol/src/index.ts` | proposal/risk/approval/result types |
| `docs/agent-tool-approval.md` | safe UX flow for dangerous tools |
| `examples/tool-approval-flow/` | approval-card protocol example |
| `docs/spatial-focus-mode-notes.md` | spatial ↔ focused mode lessons |
| `examples/spatial-state-machine/spatialStateMachine.ts` | minimal phase reducer |
| `docs/canvas-ide-performance-checklist.md` | performance checklist |
| `docs/ai-output-security.md` | output-rendering security notes |
| `tests/ai-output-security-vectors.test.ts` | generic XSS/security vectors |
| `LLM_INDEX.md` | concise machine-readable guide |
| `scripts/verify-public-safe.mjs` | obvious leak/secret marker scan |

## Integration suggestions for Cate

1. Read `docs/leaf-streaming-state.md` before wiring token streams into global React state.
2. Adapt `LeafStreamStore` around Cate panel IDs, chat IDs, or output cell IDs.
3. Treat `tool-approval-protocol` as a UI contract, not as an execution system.
4. Use `spatialStateMachine.ts` as a sketch for mode transitions and viewport restore.
5. Copy security vectors into Cate’s renderer tests, then add Cate-specific cases.
6. Run profiling before changing architecture.

## For humans

Start with:

- `docs/canvas-ide-performance-checklist.md`
- `docs/agent-tool-approval.md`
- `docs/spatial-focus-mode-notes.md`

Everything here is intentionally small. If one note saves you one debugging session, it did its job.

## For LLMs / coding agents

Read first:

1. `LLM_INDEX.md`
2. `AGENTS.md`
3. relevant `docs/*.md`
4. package or example files

Do not infer access to private repositories. Keep examples generic. Do not add credentials, app-private names, internal execution code, generated artifacts, or private identifiers.

## Development

```bash
npm install
npm test
npm run typecheck
npm run verify:public-safe
```

## License clarification

Clean-room code and docs in this repository are MIT licensed. See `LICENSE` and `NOTICE.md`.

Cate remains owned and licensed by its maintainers. Bon Courage/4dchat remains private unless its owners separately release something else.

## Safety statement

This repository was prepared as a standalone public contribution bundle. It contains no dependency on private application code and no private package imports.
