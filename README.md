# ModelConfig

Config once. Resolve the right AI model at runtime.

ModelConfig is a resolver-only configuration layer for multi-provider AI projects. It helps you:

1. define logical models like `smart`, `cheap`, `fast`
2. switch providers without hard-coded model names in app code
3. select candidates by required capabilities
4. pass the final target to OpenAI SDK, LiteLLM, or other execution layers

ModelConfig decides. Downstream tools execute.

## What Problem It Solves

Without a resolver layer, multi-model applications usually end up with:

1. hard-coded provider/model strings in business code
2. duplicated config across environments
3. no clean way to express fallbacks
4. no capability-aware selection
5. expensive migration when providers or models change

ModelConfig moves those decisions into config.

## Core Concepts

1. `providers`: concrete provider definitions like `openai` or `openai-compatible`
2. `models`: logical model groups like `smart`
3. `aliases`: stable names like `gpt-4o-latest`
4. `capabilities`: model-level ability declarations like `vision` or `json_output`
5. `resolve()`: turns a logical request into a concrete target

## Quick Start

### Requirements

1. Node.js `>= 22`
2. an environment variable for any provider API key referenced in config

### 1. Install

```bash
npm install modelconfig
```

### 2. Create a config file

```json
{
  "version": 1,
  "environments": {
    "dev": {
      "providers": {
        "openai": {
          "type": "openai",
          "api_key": "${OPENAI_API_KEY}"
        }
      },
      "models": {
        "smart": {
          "strategy": "priority",
          "candidates": ["openai:gpt-4o"]
        }
      }
    }
  }
}
```

### 3. Resolve a model

```ts
import { config, resolver } from "modelconfig";

const loaded = config.loadConfig("./modelconfig.json");

const target = resolver.resolve(loaded, {
  model: "smart",
  require: ["json_output"],
  env: "dev"
});

console.log(target);
```

### 4. Expected output

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
    "required_capabilities": ["json_output"],
    "selected_candidate": "openai:gpt-4o"
  }
}
```

## How Resolution Works

Given:

1. a logical model name
2. an environment
3. optional required capabilities

ModelConfig will:

1. load the current environment
2. resolve the logical model
3. expand aliases
4. filter candidates by capability
5. select the first valid candidate by strategy
6. return a concrete provider/model target

## Example Commands

### Basic example

```bash
npm run example:basic
```

What it shows:

1. config loading
2. alias resolution
3. capability filtering
4. final `ResolveResult`

Files:

1. [examples/basic/modelconfig.json](/Users/lauzanhing/Desktop/ModelConfig/examples/basic/modelconfig.json)
2. [examples/basic/run.mjs](/Users/lauzanhing/Desktop/ModelConfig/examples/basic/run.mjs)

### OpenAI SDK example

```bash
npm run example:openai-sdk
```

What it shows:

1. `ResolveResult -> OpenAI client config`
2. `credentials_ref -> apiKey`
3. `base_url -> baseURL`
4. `model -> responses.create()` payload

Files:

1. [examples/with-openai-sdk/modelconfig.json](/Users/lauzanhing/Desktop/ModelConfig/examples/with-openai-sdk/modelconfig.json)
2. [examples/with-openai-sdk/run.mjs](/Users/lauzanhing/Desktop/ModelConfig/examples/with-openai-sdk/run.mjs)

### LiteLLM example

```bash
npm run example:litellm
```

What it shows:

1. ordered candidate resolution
2. primary LiteLLM completion params
3. fallback chain generation
4. a real separation between routing decisions and execution

Files:

1. [examples/with-litellm/modelconfig.json](/Users/lauzanhing/Desktop/ModelConfig/examples/with-litellm/modelconfig.json)
2. [examples/with-litellm/run.mjs](/Users/lauzanhing/Desktop/ModelConfig/examples/with-litellm/run.mjs)
3. [docs/promotion/litellm-case-study.md](/Users/lauzanhing/Desktop/ModelConfig/docs/promotion/litellm-case-study.md)

## Capability-Aware Selection

```ts
const target = resolver.resolve(loaded, {
  model: "smart",
  require: ["vision", "json_output"]
});
```

If no candidate matches the requested capabilities, ModelConfig returns `CAPABILITY_MISMATCH`.

## Supported Error Types

1. `CONFIG_INVALID`
2. `ENV_NOT_FOUND`
3. `MODEL_NOT_FOUND`
4. `ALIAS_NOT_FOUND`
5. `CAPABILITY_MISMATCH`
6. `PROVIDER_NOT_CONFIGURED`

All errors use the same shape:

```ts
{
  type,
  message,
  retryable,
  details
}
```

## Ecosystem Position

```text
Application
  -> LangChain / app logic
  -> LiteLLM / SDK client
  -> ModelConfig
  -> Provider API
```

ModelConfig is the decision layer, not the execution layer.

## Non-Goals

ModelConfig does not implement:

1. HTTP requests
2. streaming transport
3. retry queues
4. proxy/gateway serving
5. agents
6. observability or billing

## Roadmap

### v0.1

1. provider configuration
2. multi-environment resolution
3. logical models
4. aliases
5. capability-aware selection
6. integration examples

## License

MIT
