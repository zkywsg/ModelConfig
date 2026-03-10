import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { matchCandidatesByCapabilities } from '../../dist/capability/index.js';
import { createCapabilityMatrix } from '../../dist/capability/index.js';
import { getEnvConfig, loadConfig } from '../../dist/config/index.js';
import { resolveAlias, resolveLogicalModel } from '../../dist/model/index.js';
import { resolveProviderTarget } from '../../dist/provider/index.js';
import { resolve } from '../../dist/resolver/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

if (!process.env.OPENAI_API_KEY) {
  process.env.OPENAI_API_KEY = 'sk-demo-openai';
}

if (!process.env.OPENROUTER_API_KEY) {
  process.env.OPENROUTER_API_KEY = 'sk-demo-openrouter';
}

function materializeCredential(credentialsRef) {
  if (!credentialsRef) {
    return undefined;
  }

  if (!credentialsRef.startsWith('env:')) {
    return credentialsRef;
  }

  const envName = credentialsRef.slice(4);
  return process.env[envName];
}

function toLiteLLMModel(target) {
  if (target.provider === 'openai') {
    return `openai/${target.model}`;
  }

  if (target.provider === 'openrouter') {
    return `openrouter/${target.model}`;
  }

  return target.model;
}

function toLiteLLMCompletionParams(target) {
  return {
    model: toLiteLLMModel(target),
    api_base: target.base_url,
    api_key: materializeCredential(target.credentials_ref)
  };
}

function buildLiteLLMMapping(config, request) {
  const envConfig = getEnvConfig(config, request.env);
  const logical = resolveLogicalModel(envConfig, request.model);
  const capabilityMatrix = createCapabilityMatrix(config);
  const resolvedCandidates = logical.candidates.map((candidate) => resolveAlias(candidate, config.aliases ?? {}));
  const matched = matchCandidatesByCapabilities(capabilityMatrix, resolvedCandidates, request.require ?? []).matched;
  const targets = matched.map((candidate) => resolveProviderTarget(envConfig, candidate));

  return {
    primary: toLiteLLMCompletionParams(targets[0]),
    fallbacks: targets.slice(1).map((target) => toLiteLLMCompletionParams(target))
  };
}

const configPath = join(__dirname, 'modelconfig.json');
const config = loadConfig(configPath);
const request = {
  model: 'smart',
  require: ['json_output'],
  env: 'dev'
};

const resolved = resolve(config, request);
const litellm = buildLiteLLMMapping(config, request);

const output = {
  resolved,
  primary_completion_params: {
    ...litellm.primary,
    messages: [{ role: 'user', content: 'Explain ModelConfig in one sentence.' }]
  },
  fallback_chain: litellm.fallbacks
};

console.log('[ModelConfig LiteLLM example]');
console.log(JSON.stringify(output, null, 2));
