import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadConfig } from '../../dist/config/index.js';
import { resolve } from '../../dist/resolver/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

if (!process.env.OPENAI_API_KEY) {
  process.env.OPENAI_API_KEY = 'sk-demo-openai';
}

if (!process.env.AZURE_OPENAI_PROXY_KEY) {
  process.env.AZURE_OPENAI_PROXY_KEY = 'sk-demo-proxy';
}

function materializeCredential(credentialsRef) {
  if (!credentialsRef) {
    return undefined;
  }

  if (!credentialsRef.startsWith('env:')) {
    return credentialsRef;
  }

  const envName = credentialsRef.slice(4);
  const envValue = process.env[envName];

  if (!envValue) {
    throw new Error(`Missing environment variable '${envName}' for OpenAI SDK example.`);
  }

  return envValue;
}

function toOpenAIClientConfig(resolveResult) {
  return {
    apiKey: materializeCredential(resolveResult.credentials_ref),
    baseURL: resolveResult.base_url
  };
}

function toResponsesRequest(resolveResult) {
  return {
    model: resolveResult.model,
    input: [
      {
        role: 'user',
        content: [{ type: 'input_text', text: 'Summarize why ModelConfig exists in one sentence.' }]
      }
    ]
  };
}

const configPath = join(__dirname, 'modelconfig.json');
const config = loadConfig(configPath);
const resolved = resolve(config, {
  model: 'assistant',
  require: ['json_output'],
  env: 'dev'
});

const clientConfig = toOpenAIClientConfig(resolved);
const requestPayload = toResponsesRequest(resolved);

console.log('[ModelConfig OpenAI SDK example]');
console.log(JSON.stringify({ resolved, clientConfig, requestPayload }, null, 2));

try {
  const { default: OpenAI } = await import('openai');
  const client = new OpenAI(clientConfig);

  console.log('[OpenAI SDK client instantiated]');
  console.log(JSON.stringify({ hasClient: Boolean(client), baseURL: clientConfig.baseURL }, null, 2));
} catch {
  console.log('[OpenAI SDK not installed]');
  console.log("Install 'openai' to execute the real request step.");
}
