# Contributing

## Scope

ModelConfig is a resolver-only project.

Please keep contributions aligned with that boundary:

1. in scope: config loading, resolution logic, capability matching, errors, examples, docs, release assets
2. out of scope: HTTP execution, streaming transport, retry orchestration, agent frameworks, observability platforms

## Development Flow

1. update the SOP task status in `docs/plans/2026-02-16-modelconfig-mvp-task-breakdown.md`
2. append a change record in `docs/plans/2026-02-16-modelconfig-mvp.md`
3. add a task-specific execution note in `docs/plans/YYYY-MM-DD-<task-id>.md`
4. keep examples and README in sync with behavior changes

## Setup

Requirements:

1. Node.js `>= 22`

Commands:

```bash
npm run build
npm test
npm run example:basic
npm run example:openai-sdk
npm run example:litellm
```

## Code Expectations

1. preserve resolver-only architecture
2. keep public error types stable
3. prefer additive changes over implicit behavior changes
4. update tests for behavior changes
5. update examples if public integration flow changes

## Pull Request Checklist

Before opening a PR:

1. `npm run build` passes
2. `npm test` passes
3. affected examples still run
4. docs are updated
5. scope is still resolver-only

## Issue Reports

Good issues include:

1. config sample
2. expected result
3. actual result
4. environment info
5. reproduction steps
