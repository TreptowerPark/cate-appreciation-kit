# Agent instructions

This repo is public-safe by design.

Rules for future coding agents:

- Do not add private code or private source-tree excerpts.
- Keep examples generic: use `panelId`, `streamId`, `conversationId`, `toolId`, `nodeId`, and `viewport`.
- Do not add credentials, tokens, auth files, local databases, screenshots, or generated build output.
- Do not add private package imports.
- Do not implement hidden shell/file execution internals; keep tool approval as protocol and UX pattern.
- Preserve warm, modest tone for Cate-style canvas IDE builders.
- Keep canvas navigation utilities framework-free and policy-oriented; do not bind them to app-specific canvas state.
- Run `npm test`, `npm run typecheck`, and `npm run verify:public-safe` before committing.
- If public-safety scan flags anything, stop and report before publishing.
