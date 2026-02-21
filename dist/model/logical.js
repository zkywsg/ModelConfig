import { ModelConfigError } from '../errors/errors.js';
export function resolveLogicalModel(envConfig, modelName) {
    const logicalModel = envConfig.models[modelName];
    if (!logicalModel) {
        throw ModelConfigError.modelNotFound(`Model '${modelName}' not found in current environment.`, {
            model: modelName,
            available_models: Object.keys(envConfig.models)
        });
    }
    if (logicalModel.strategy !== 'priority') {
        throw ModelConfigError.configInvalid(`Model '${modelName}' has unsupported strategy '${String(logicalModel.strategy)}'.`, {
            model: modelName,
            strategy: logicalModel.strategy
        });
    }
    if (!Array.isArray(logicalModel.candidates) || logicalModel.candidates.length === 0) {
        throw ModelConfigError.configInvalid(`Model '${modelName}' candidates cannot be empty.`, {
            model: modelName
        });
    }
    return {
        logical_model: modelName,
        strategy: 'priority',
        candidates: [
            ...logicalModel.candidates
        ]
    };
}
