<p align="center">
  <h1 align="center">ModelConfig</h1>
  <p align="center">
    <b>Prisma for AI Providers</b><br/>
    Config once. Use any model. Capability-aware.
  </p>
</p>

<p align="center">
  <img src="https://img.shields.io/npm/v/modelconfig" />
  <img src="https://img.shields.io/github/stars/yourname/modelconfig?style=social" />
  <img src="https://img.shields.io/github/license/yourname/modelconfig" />
</p>

---

## Why ModelConfig?

Integrating multiple AI models today is messy:

- Different configuration formats  
- Hard-coded model names in code  
- Feature differences between providers  
- Environment management is painful  
- Vendor lock-in is real  

**ModelConfig solves this by separating:**

> What your app needs  
> from  
> Which model should be used  

---

## What is ModelConfig?

ModelConfig is a **configuration and capability resolver layer** for AI providers.

It helps you:

- Manage multiple providers with Config-as-Code  
- Define logical models (`smart`, `cheap`, `fast`)  
- Avoid vendor lock-in  
- Select models based on required capabilities  
- Work with LiteLLM, LangChain, or official SDKs  

**ModelConfig decides the model — it does not call it.**

---

## Example

### config.yaml

```yaml
environments:
  prod:
    providers:
      openai:
        type: openai
        api_key: ${OPENAI_API_KEY}

    models:
      smart:
        strategy: priority
        candidates:
          - openai:gpt-4o
```

---

### Usage

```ts
const target = resolver.resolve({
  model: "smart",
  require: ["vision"]
})

// pass target to LiteLLM / LangChain / OpenAI SDK
```

---

## Capability-Aware Selection

```ts
resolver.resolve({
  model: "smart",
  require: ["vision", "json_output"]
})
```

ModelConfig will:

- Filter models that support required capabilities  
- Select the best candidate  
- Or return a clear error if none match  

---

## Ecosystem Position

```
Application
   ↓
Framework (LangChain)
   ↓
Gateway (LiteLLM)
   ↓
ModelConfig   ← this project
   ↓
Provider SDK
   ↓
Model APIs
```

ModelConfig is the missing configuration layer between your app and AI providers.

---

## Core Features

- Config-as-Code  
- Multi-environment support  
- Logical models  
- Model aliasing  
- Capability matrix  
- Capability-aware resolution  
- OpenAI-compatible support  
- Resolver-only architecture  

---

## Non-Goals

ModelConfig intentionally does **not** include:

- HTTP calling  
- Streaming implementation  
- Retry logic  
- Gateway / proxy  
- Agent framework  
- Monitoring platform  

Execution should be handled by:

- LiteLLM  
- LangChain  
- Official provider SDKs  

---

## Installation (coming soon)

```
npm install modelconfig
```

---

## Roadmap

### v0.1 (MVP)

- Provider configuration  
- Environment support  
- Logical models  
- Model alias  
- Basic resolver  

### Next

- Capability matrix  
- Capability matching  
- Static routing  
- Cost estimation  

---

## Vision

Define what capability you need.  
Let the system choose the model.

---

## License

MIT