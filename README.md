# ModelConfig

> Config once. Resolve the right AI model at runtime.

[![MIT License](https://img.shields.io/badge/license-MIT-111111.svg)](./LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D22-3C873A.svg)](./package.json)
[![Schema](https://img.shields.io/badge/config-JSON%20Schema-0A66C2.svg)](./config.schema.json)
[![Examples](https://img.shields.io/badge/examples-3-blue.svg)](./examples)

ModelConfig is a resolver-only config layer for multi-provider AI apps.

It lets your app ask for logical models like `smart`, `cheap`, or `assistant`, then resolves them into the right provider + concrete model + credentials reference at runtime.

That means you can swap providers, define fallbacks, and gate by capabilities without scattering provider strings through your business code.

## Why It Exists

Most AI apps start like this:

```ts
const model = "gpt-4o";
const backup = "openai/gpt-4o-mini";
```

A few weeks later, model routing is spread across the codebase:

- provider names are hard-coded in application logic
- staging and production drift apart
- capability checks are ad hoc
- fallback chains are duplicated
- migrations become expensive

ModelConfig moves those decisions into config.

Your app stays simple:

```ts
const target = resolver.resolve(config, {
  model: "smart",
  require: ["json_output", "vision"],
  env: "prod"
});
```

## What You Get

- Logical model names your app can depend on long term
- Provider/model decoupling so migrations do not touch product code
- Capability-aware selection such as `vision`, `tools`, or `json_output`
- Ordered candidate resolution and fallback-friendly outputs
- Environment-specific routing for `dev`, `staging`, and `prod`
- Clean handoff into OpenAI SDK, LiteLLM, or your own execution layer
- A JSON Schema-backed config format

## Positioning

ModelConfig is the decision layer, not the execution layer.

```text
Application / Agent / API
          |
          v
      ModelConfig
          |
          v
 OpenAI SDK / LiteLLM / Custom client
          |
          v
      Provider APIs
```

If you already use an SDK, proxy, or router, ModelConfig fits in front of it.

## Quick Start

### Install

```bash
npm install modelconfig
```

### Define a config

```json
{
  "version": 1,
  "environments": {
    "dev": {
      "providers": {
        "openai": {
          "type": "openai",
          "api_key": "${OPENAI_API_KEY}"
        },
        "openrouter": {
          "type": "openai-compatible",
          "base_url": "https://openrouter.ai/api/v1",
          "api_key": "${OPENROUTER_API_KEY}"
        }
      },
      "models": {
        "smart": {
          "strategy": "priority",
          "candidates": [
            "smart-latest",
            "openrouter:openai/gpt-4o-mini"
          ]
        }
      }
    }
  },
  "aliases": {
    "smart-latest": "openai:gpt-4o"
  },
  "capabilities": {
    "overrides": {
      "openai:gpt-4o": ["vision", "json_output", "tools"],
      "openrouter:openai/gpt-4o-mini": ["json_output", "streaming"]
    }
  }
}
```

### Resolve at runtime

```ts
import { config, resolver } from "modelconfig";

const loaded = config.loadConfig("./modelconfig.json");

const target = resolver.resolve(loaded, {
  model: "smart",
  require: ["vision", "json_output"],
  env: "dev"
});

console.log(target);
```

### Result

```json
{
  "provider": "openai",
  "model": "gpt-4o",
  "base_url": "https://api.openai.com/v1",
  "credentials_ref": "env:OPENAI_API_KEY",
  "logical_model": "smart",
  "env": "dev",
  "metadata": {
    "logical_model": "smart",
    "env": "dev",
    "strategy": "priority",
    "required_capabilities": ["vision", "json_output"],
    "selected_candidate": "openai:gpt-4o"
  }
}
```

## The Core Idea

Instead of writing app code against vendor model IDs, write against intent:

| App asks for | ModelConfig decides | Execution layer does |
| --- | --- | --- |
| `smart` | which provider/model fits | sends the request |
| `cheap` | best low-cost candidate | sends the request |
| `vision` + `json_output` | which target supports both | sends the request |

This separation matters when you need to:

- move from one provider to another
- introduce an internal proxy
- add a cheaper fallback
- split environments cleanly
- support capability-based routing

## Use Cases

### 1. Stable app code, changing providers

Keep application code pinned to `assistant`, while config decides whether that means `openai:gpt-4.1` today or a proxy-backed deployment tomorrow.

### 2. Capability-aware routing

Require `vision` or `tools` only when needed, and fail with a clear typed error if nothing matches.

### 3. LiteLLM or gateway frontends

Use ModelConfig to produce the primary target and ordered fallbacks, then let LiteLLM or your gateway handle retries and execution.

### 4. Multi-environment AI stacks

Run one routing policy in `dev`, a different one in `prod`, and keep both in the same schema-driven config system.

## Examples

### Basic

Minimal end-to-end flow:

- load config
- resolve a logical model
- expand aliases
- filter by capabilities
- print the final `ResolveResult`

Run:

```bash
npm run example:basic
```

Files:

- [`examples/basic/modelconfig.json`](./examples/basic/modelconfig.json)
- [`examples/basic/run.mjs`](./examples/basic/run.mjs)

### OpenAI SDK

Shows how to transform a `ResolveResult` into OpenAI client config and a `responses.create()` payload.

Run:

```bash
npm run example:openai-sdk
```

Files:

- [`examples/with-openai-sdk/modelconfig.json`](./examples/with-openai-sdk/modelconfig.json)
- [`examples/with-openai-sdk/run.mjs`](./examples/with-openai-sdk/run.mjs)

### LiteLLM

Shows how to convert ModelConfig output into primary LiteLLM params plus a fallback chain.

Run:

```bash
npm run example:litellm
```

Files:

- [`examples/with-litellm/modelconfig.json`](./examples/with-litellm/modelconfig.json)
- [`examples/with-litellm/run.mjs`](./examples/with-litellm/run.mjs)

## Resolution Flow

When you call `resolve()`, ModelConfig:

1. loads the selected environment
2. finds the logical model definition
3. expands aliases into concrete `provider:model` targets
4. filters candidates by required capabilities
5. applies the model strategy
6. returns a concrete target for downstream execution

## Error Model

Errors are typed and explicit:

- `CONFIG_INVALID`
- `ENV_NOT_FOUND`
- `MODEL_NOT_FOUND`
- `ALIAS_NOT_FOUND`
- `CAPABILITY_MISMATCH`
- `PROVIDER_NOT_CONFIGURED`

All errors share the same shape:

```ts
{
  type,
  message,
  retryable,
  details
}
```

## API Surface

```ts
import { config, resolver, capability, model, provider, errors } from "modelconfig";
```

Main entry points:

- `config.loadConfig(path)`
- `resolver.resolve(config, request)`

## Non-Goals

ModelConfig does not try to be:

- an inference SDK
- a proxy or gateway server
- a retry engine
- a streaming transport
- an agent framework
- an observability platform

That constraint is intentional. It keeps the library small, composable, and easy to trust.

## Why People Star Projects Like This

- It solves a real integration pain without forcing a platform rewrite
- It is small enough to understand quickly
- It works with the tools teams already use
- It turns messy AI routing logic into a clean config contract

If that is your problem space, this repo is built for you.

## Development

Requirements:

- Node.js `>= 22`

Useful commands:

```bash
npm run build
npm test
npm run example:basic
npm run example:openai-sdk
npm run example:litellm
```

## Roadmap

Current `v0.1.0` scope:

- provider configuration
- logical models
- aliases
- capability-aware selection
- multi-environment resolution
- integration examples

## Contributing

Issues and PRs are welcome.

If you are building multi-provider AI systems and hit rough edges, open an issue with your routing use case. Those reports are the fastest way to make the resolver more useful.

## License

MIT
