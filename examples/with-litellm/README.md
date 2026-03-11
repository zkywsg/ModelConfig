# LiteLLM Example

This example shows how to map ModelConfig output into LiteLLM-style request data.

Run:

```bash
npm run example:litellm
```

What it demonstrates:

1. resolve a logical model with capability filtering
2. convert the selected target into LiteLLM completion params
3. preserve the remaining ordered candidates as a fallback chain
4. keep routing decisions in config instead of scattering provider/model strings in application code

Output structure:

1. `resolved`: the final `ResolveResult`
2. `primary_completion_params`: the primary request parameters you can pass to LiteLLM
3. `fallback_chain`: ordered backup targets for router/proxy fallback logic

Real-world framing:

1. application code asks for `smart`
2. ModelConfig selects the ordered candidate set
3. LiteLLM receives the primary request params plus fallback chain
4. execution remains in LiteLLM, not in ModelConfig

Case study:

1. [docs/promotion/litellm-case-study.md](/Users/lauzanhing/Desktop/ModelConfig/docs/promotion/litellm-case-study.md)

Implementation note:

According to the LiteLLM docs, the core completion call accepts `model`, `messages`, and provider-specific fields such as `api_base`, and LiteLLM Router handles retry/fallback logic across deployments. This example keeps those concerns separate: ModelConfig decides ordering, LiteLLM executes it.
