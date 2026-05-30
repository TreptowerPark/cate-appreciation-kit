# Contributing

Small, generic improvements are welcome.

Good contributions:

- clearer docs for spatial canvas IDEs
- more generic security vectors
- smaller TypeScript examples
- tests that do not require services
- performance notes backed by browser or React profiling

Please avoid:

- app-specific business logic
- provider-specific secrets or auth flows
- private identifiers
- generated artifacts
- large framework rewrites

Before opening a change:

```bash
npm test
npm run typecheck
npm run verify:public-safe
```
