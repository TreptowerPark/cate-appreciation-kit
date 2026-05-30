# Agent tool approval UX pattern

Dangerous tools need a human-readable pause point. This is especially important in desktop IDEs where tools may read files, write files, run shell commands, or touch browser/webview state.

This repo provides a protocol sketch only. It does not include execution internals.

## Flow

1. Model proposes tool call.
2. App classifies risk.
3. App renders approval card.
4. User approves, denies, or lets it expire.
5. Host app runs approved tool if appropriate.
6. Result is fed back to the agent.

## Approval card should show

- tool name
- plain-language risk label
- exact arguments or safe summary
- working directory or target surface when relevant
- why the model wants it
- approve and deny buttons with equal clarity
- timeout/expiry state when useful

## Risk examples

| Tool shape | Risk | Default |
| --- | --- | --- |
| read/list/search | low | may be auto-run if policy allows |
| network/browser | medium | ask when data may leave machine |
| file write/delete/rename | high | require approval |
| shell/terminal/exec | critical | require approval |

## Design reminders

- Never make approval look like a toast that disappears unnoticed.
- Do not hide exact file paths or commands.
- Do not run first and ask later.
- Keep denial useful: feed a clear blocked result back to the model.
- Consider per-workspace policy, but keep dangerous actions explicit.
