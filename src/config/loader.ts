import { existsSync, readFileSync } from 'node:fs';
import { extname, resolve } from 'node:path';
import { ModelConfigError } from '../errors/errors.ts';
import type { ModelConfig } from '../types.ts';
import { parseYaml } from './yaml.ts';

const DEFAULT_FILES = ['modelconfig.yaml', 'modelconfig.yml', 'modelconfig.json'];
const ENV_VAR_TOKEN = /\$\{([A-Z0-9_]+)\}/g;

function resolveConfigPath(inputPath?: string): string {
  if (inputPath) {
    return resolve(inputPath);
  }

  for (const fileName of DEFAULT_FILES) {
    const filePath = resolve(fileName);
    if (existsSync(filePath)) return filePath;
  }

  throw ModelConfigError.configInvalid('Config file not found.');
}

function parseContent(content: string, filePath: string): unknown {
  const ext = extname(filePath).toLowerCase();

  try {
    if (ext === '.json') {
      return JSON.parse(content);
    }

    if (ext === '.yaml' || ext === '.yml') {
      return parseYaml(content);
    }

    try {
      return JSON.parse(content);
    } catch {
      return parseYaml(content);
    }
  } catch (error) {
    if (error instanceof ModelConfigError) {
      throw error;
    }

    throw ModelConfigError.configInvalid(`Failed to parse config: ${filePath}`, {
      cause: error instanceof Error ? error.message : String(error)
    });
  }
}

function interpolateString(value: string, fieldPath: string): string {
  const fullMatch = value.match(/^\$\{([A-Z0-9_]+)\}$/);

  if (fullMatch) {
    const envName = fullMatch[1];
    if (process.env[envName] === undefined) {
      throw ModelConfigError.configInvalid(`Missing environment variable '${envName}'.`, {
        env: envName,
        field: fieldPath
      });
    }
    return `env:${envName}`;
  }

  return value.replace(ENV_VAR_TOKEN, (_, envName: string) => {
    const envValue = process.env[envName];
    if (envValue === undefined) {
      throw ModelConfigError.configInvalid(`Missing environment variable '${envName}'.`, {
        env: envName,
        field: fieldPath
      });
    }
    return envValue;
  });
}

function interpolateEnvVariables(value: unknown, fieldPath = '$'): unknown {
  if (typeof value === 'string') {
    return interpolateString(value, fieldPath);
  }

  if (Array.isArray(value)) {
    return value.map((item, index) => interpolateEnvVariables(item, `${fieldPath}[${index}]`));
  }

  if (typeof value === 'object' && value !== null) {
    const result: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
      result[key] = interpolateEnvVariables(item, `${fieldPath}.${key}`);
    }
    return result;
  }

  return value;
}

export function loadConfig(inputPath?: string): ModelConfig {
  const filePath = resolveConfigPath(inputPath);
  const content = readFileSync(filePath, 'utf8');
  const parsed = parseContent(content, filePath);
  const interpolated = interpolateEnvVariables(parsed);

  if (typeof interpolated !== 'object' || interpolated === null || Array.isArray(interpolated)) {
    throw ModelConfigError.configInvalid('Config root must be an object.');
  }

  return interpolated as ModelConfig;
}
