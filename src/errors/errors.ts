export type ErrorType =
  | 'CONFIG_INVALID'
  | 'ENV_NOT_FOUND'
  | 'MODEL_NOT_FOUND'
  | 'ALIAS_NOT_FOUND'
  | 'CAPABILITY_MISMATCH'
  | 'PROVIDER_NOT_CONFIGURED';

export class ModelConfigError extends Error {
  readonly type: ErrorType;
  readonly retryable: boolean;
  readonly details?: Record<string, unknown>;

  constructor(type: ErrorType, message: string, details?: Record<string, unknown>) {
    super(message);
    this.name = 'ModelConfigError';
    this.type = type;
    this.retryable = false;
    this.details = details;
  }

  static configInvalid(message: string, details?: Record<string, unknown>): ModelConfigError {
    return new ModelConfigError('CONFIG_INVALID', message, details);
  }

  static envNotFound(message: string, details?: Record<string, unknown>): ModelConfigError {
    return new ModelConfigError('ENV_NOT_FOUND', message, details);
  }

  static modelNotFound(message: string, details?: Record<string, unknown>): ModelConfigError {
    return new ModelConfigError('MODEL_NOT_FOUND', message, details);
  }
}

export function isModelConfigError(error: unknown): error is ModelConfigError {
  return error instanceof ModelConfigError;
}
