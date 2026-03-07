const DEFAULT_RETRYABLE = {
    CONFIG_INVALID: false,
    ENV_NOT_FOUND: false,
    MODEL_NOT_FOUND: false,
    ALIAS_NOT_FOUND: false,
    CAPABILITY_MISMATCH: false,
    PROVIDER_NOT_CONFIGURED: false
};
export class ModelConfigError extends Error {
    type;
    retryable;
    details;
    constructor(type, message, details, retryable = DEFAULT_RETRYABLE[type]){
        super(message);
        this.name = 'ModelConfigError';
        this.type = type;
        this.retryable = retryable;
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
    static aliasNotFound(message, details) {
        return new ModelConfigError('ALIAS_NOT_FOUND', message, details);
    }
    static capabilityMismatch(message, details) {
        return new ModelConfigError('CAPABILITY_MISMATCH', message, details);
    }
    static providerNotConfigured(message, details) {
        return new ModelConfigError('PROVIDER_NOT_CONFIGURED', message, details);
    }
    toJSON() {
        return {
            type: this.type,
            message: this.message,
            retryable: this.retryable,
            details: this.details
        };
    }
}
export function isModelConfigError(error) {
    return error instanceof ModelConfigError;
}
