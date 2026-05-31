# LLM_INDEX

Purpose: small public-safe contribution bundle for Cate-style spatial AI canvas IDE builders.

Public-safe boundaries:

- Standalone clean-room TypeScript and docs only.
- No private repository access required.
- No private imports, credentials, auth flows, telemetry internals, app schemas, or agent execution internals.
- This repository does not license or expose the 4dchat or Bon Courage codebase.

Artifact map:

- Leaf streaming: `packages/leaf-stream-store/src/*`, `docs/leaf-streaming-state.md`, `examples/leaf-streaming-react/`
- Tool approval: `packages/tool-approval-protocol/src/index.ts`, `docs/agent-tool-approval.md`, `examples/tool-approval-flow/`
- Spatial/focus mode: `docs/spatial-focus-mode-notes.md`, `examples/spatial-state-machine/spatialStateMachine.ts`
- Performance: `docs/canvas-ide-performance-checklist.md`
- Canvas navigation UX: `packages/canvas-navigation-ux/src/*`, `docs/canvas-navigation-ux.md`, `docs/high-density-canvas-navigation-principles.md`, `examples/canvas-navigation-policy/`, `tests/canvas-navigation-ux.test.ts`
- AI output security: `docs/ai-output-security.md`, `tests/ai-output-security-vectors.test.ts`
- Public safety scan: `scripts/verify-public-safe.mjs`

Suggested starting points:

1. `README.md`
2. `docs/canvas-ide-performance-checklist.md`
3. `docs/leaf-streaming-state.md`
4. `docs/agent-tool-approval.md`
5. `docs/canvas-navigation-ux.md`
6. `tests/ai-output-security-vectors.test.ts`

What not to infer:

- Do not infer private architecture beyond these generic patterns.
- Do not infer provider choices, local data formats, root-agent internals, or product roadmap.
- Do not use private package names in public code.
- Do not vendor Cate code here.
