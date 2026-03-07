import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadConfig } from '../../dist/config/index.js';
import { resolve } from '../../dist/resolver/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

if (!process.env.OPENAI_API_KEY) {
  process.env.OPENAI_API_KEY = 'sk-demo-openai';
}

if (!process.env.OPENROUTER_API_KEY) {
  process.env.OPENROUTER_API_KEY = 'sk-demo-openrouter';
}

const configPath = join(__dirname, 'modelconfig.json');
const config = loadConfig(configPath);
const result = resolve(config, {
  model: 'smart',
  require: ['vision', 'json_output'],
  env: 'dev'
});

console.log('[ModelConfig basic example]');
console.log(JSON.stringify(result, null, 2));
