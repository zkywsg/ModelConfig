import { ModelConfigError } from '../errors/errors.ts';
import type { EnvironmentConfig, ModelConfig } from '../types.ts';

export function getEnvConfig(config: ModelConfig, env?: string): EnvironmentConfig {
  const envName = env ?? process.env.AI_ENV ?? 'dev';
  const envConfig = config.environments[envName];

  if (!envConfig) {
    throw ModelConfigError.envNotFound(`Environment '${envName}' not found.`, {
      env: envName,
      available: Object.keys(config.environments)
    });
  }

  return envConfig;
}
