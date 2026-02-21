export class ModelConfigError extends Error {
    type;
    retryable;
    details;
    constructor(type, message, details){
        super(message);
        this.name = 'ModelConfigError';
        this.type = type;
        this.retryable = false;
        this.details = details;
    }
    static configInvalid(message, details) {
        return new ModelConfigError('CONFIG_INVALID', message, details);
    }
    static envNotFound(message, details) {
        return new ModelConfigError('ENV_NOT_FOUND', message, details);
    }
    static modelNotFound(message, details) {
        return new ModelConfigError('MODEL_NOT_FOUND', message, details);
    }
}
export function isModelConfigError(error) {
    return error instanceof ModelConfigError;
}
