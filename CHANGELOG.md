# Changelog

All notable changes to this project will be documented in this file.

## v0.1.0 - 2026-03-10

Initial public MVP release.

### Added

1. configuration loading from JSON, YAML, and YML
2. environment variable interpolation with consistent validation errors
3. multi-environment resolution via `getEnvConfig()`
4. logical model resolution with `priority` strategy
5. alias resolution with cycle detection
6. provider target resolution for `openai` and `openai-compatible`
7. capability matrix with built-in entries and user overrides
8. capability-aware filtering through `require[]`
9. unified error contract:
   - `CONFIG_INVALID`
   - `ENV_NOT_FOUND`
   - `MODEL_NOT_FOUND`
   - `ALIAS_NOT_FOUND`
   - `CAPABILITY_MISMATCH`
   - `PROVIDER_NOT_CONFIGURED`
10. `ResolveResult.metadata` with resolution context
11. runnable examples:
   - `examples/basic`
   - `examples/with-openai-sdk`
   - `examples/with-litellm`
12. boundary error regression tests via `npm test`
13. release assets:
   - `LICENSE`
   - `CONTRIBUTING.md`
   - GitHub issue templates

### Changed

1. README was rewritten into a real quick-start document
2. examples now reflect the resolver-only positioning of the project
3. release checklist now tracks current repository readiness for `v0.1.0`

### Known Limitations

1. ModelConfig is resolver-only and does not execute HTTP requests
2. only `priority` strategy is supported in `v0.1.0`
3. capability data is built-in plus user override, not live-synced from remote sources
4. the custom YAML parser is intentionally minimal and does not cover full YAML syntax
5. release notes and npm publishing flow are documented separately from runtime code
