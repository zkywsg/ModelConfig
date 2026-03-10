# OpenAI SDK Example

This example shows how to convert a `ResolveResult` into:

1. an OpenAI client config
2. a request payload for `responses.create()`

Run:

```bash
npm run example:openai-sdk
```

What it demonstrates:

1. load config from `examples/with-openai-sdk/modelconfig.json`
2. resolve a logical model (`assistant`)
3. transform `credentials_ref` into a real API key
4. map `base_url` to `baseURL`
5. map `model` to an OpenAI Responses API payload

Optional real SDK step:

```bash
npm install openai
```

After installing `openai`, the same example will instantiate an `OpenAI` client locally.
