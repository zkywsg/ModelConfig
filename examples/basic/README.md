# Basic Example

This example demonstrates the minimum ModelConfig flow:

1. Load a local config file.
2. Resolve a logical model (`smart`).
3. Apply alias mapping (`smart-latest -> gpt-4o-latest -> openai:gpt-4o`).
4. Filter candidates by required capabilities.
5. Print the final `ResolveResult`.

Run:

```bash
npm run example:basic
```

Config file:

- `examples/basic/modelconfig.json`

Expected output:

- `provider`
- `model`
- `base_url`
- `credentials_ref`
- `logical_model`
- `env`
- `metadata`
