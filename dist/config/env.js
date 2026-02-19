import { ModelConfigError } from '../errors/errors.js';
export function getEnvConfig(config, env) {
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
