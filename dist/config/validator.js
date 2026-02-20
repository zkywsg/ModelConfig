import { ModelConfigError } from '../errors/errors.js';
function isObject(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function assertConfig(condition, message, details) {
    if (!condition) {
        throw ModelConfigError.configInvalid(message, details);
    }
}
function validateLogicalModel(modelName, modelValue, envName) {
    assertConfig(isObject(modelValue), `Model '${modelName}' in '${envName}' must be an object.`);
    const strategy = modelValue.strategy;
    const candidates = modelValue.candidates;
    assertConfig(strategy === 'priority', `Model '${modelName}' in '${envName}' only supports strategy='priority'.`);
    assertConfig(Array.isArray(candidates), `Model '${modelName}' in '${envName}' requires candidates array.`);
    assertConfig(candidates.length > 0, `Model '${modelName}' in '${envName}' candidates cannot be empty.`);
    for (const candidate of candidates){
        assertConfig(typeof candidate === 'string' && candidate.length > 0, `Model '${modelName}' in '${envName}' has invalid candidate.`, {
            candidate
        });
    }
}
function validateProvider(providerName, providerValue, envName) {
    assertConfig(isObject(providerValue), `Provider '${providerName}' in '${envName}' must be an object.`);
    const providerType = providerValue.type;
    assertConfig(typeof providerType === 'string' && providerType.length > 0, `Provider '${providerName}' in '${envName}' requires type.`);
    if (providerType === 'openai') {
        assertConfig(typeof providerValue.api_key === 'string' && providerValue.api_key.length > 0, `Provider '${providerName}' in '${envName}' requires api_key.`);
    }
    if (providerType === 'openai-compatible') {
        assertConfig(typeof providerValue.base_url === 'string' && providerValue.base_url.length > 0, `Provider '${providerName}' in '${envName}' requires base_url.`);
        assertConfig(typeof providerValue.api_key === 'string' && providerValue.api_key.length > 0, `Provider '${providerName}' in '${envName}' requires api_key.`);
    }
}
export function validateConfig(config) {
    assertConfig(isObject(config), 'Config root must be an object.');
    const version = config.version;
    const environments = config.environments;
    assertConfig(typeof version === 'number', 'version must be a number.');
    assertConfig(isObject(environments), 'environments must be an object.');
    for (const [envName, envValue] of Object.entries(environments)){
        assertConfig(isObject(envValue), `Environment '${envName}' must be an object.`);
        assertConfig(isObject(envValue.providers), `Environment '${envName}' requires providers object.`);
        assertConfig(isObject(envValue.models), `Environment '${envName}' requires models object.`);
        for (const [providerName, providerValue] of Object.entries(envValue.providers)){
            validateProvider(providerName, providerValue, envName);
        }
        for (const [modelName, modelValue] of Object.entries(envValue.models)){
            validateLogicalModel(modelName, modelValue, envName);
        }
    }
    if (config.aliases !== undefined) {
        assertConfig(isObject(config.aliases), 'aliases must be an object when provided.');
        for (const [alias, target] of Object.entries(config.aliases)){
            assertConfig(alias.length > 0, 'aliases key cannot be empty.');
            assertConfig(typeof target === 'string' && target.length > 0, `Alias '${alias}' target must be non-empty string.`);
        }
    }
    if (config.capabilities !== undefined) {
        assertConfig(isObject(config.capabilities), 'capabilities must be an object when provided.');
        if (config.capabilities.sources !== undefined) {
            assertConfig(Array.isArray(config.capabilities.sources), 'capabilities.sources must be an array.');
            for (const source of config.capabilities.sources){
                assertConfig(typeof source === 'string' && source.length > 0, 'capabilities.sources must only contain strings.');
            }
        }
        if (config.capabilities.overrides !== undefined) {
            assertConfig(isObject(config.capabilities.overrides), 'capabilities.overrides must be an object.');
            for (const [modelRef, value] of Object.entries(config.capabilities.overrides)){
                assertConfig(Array.isArray(value), `capabilities.overrides['${modelRef}'] must be an array.`);
                for (const capability of value){
                    assertConfig(typeof capability === 'string' && capability.length > 0, `capabilities.overrides['${modelRef}'] has invalid capability.`);
                }
            }
        }
    }
}
