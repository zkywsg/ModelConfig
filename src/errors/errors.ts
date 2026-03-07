export type ErrorType =
  | 'CONFIG_INVALID'
  | 'ENV_NOT_FOUND'
  | 'MODEL_NOT_FOUND'
  | 'ALIAS_NOT_FOUND'
  | 'CAPABILITY_MISMATCH'
  | 'PROVIDER_NOT_CONFIGURED';

const DEFAULT_RETRYABLE: Record<ErrorType, boolean> = {
  CONFIG_INVALID: false,
  ENV_NOT_FOUND: false,
  MODEL_NOT_FOUND: false,
  ALIAS_NOT_FOUND: false,
  CAPABILITY_MISMATCH: false,
  PROVIDER_NOT_CONFIGURED: false
};

export class ModelConfigError extends Error {
  readonly type: ErrorType;
  readonly retryable: boolean;
  readonly details?: Record<string, unknown>;

  constructor(type: ErrorType, message: string, details?: Record<string, unknown>, retryable = DEFAULT_RETRYABLE[type]) {
    super(message);
    this.name = 'ModelConfigError';
    this.type = type;
    this.retryable = retryable;
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

  static aliasNotFound(message: string, details?: Record<string, unknown>): ModelConfigError {
    return new ModelConfigError('ALIAS_NOT_FOUND', message, details);
  }

  static capabilityMismatch(message: string, details?: Record<string, unknown>): ModelConfigError {
    return new ModelConfigError('CAPABILITY_MISMATCH', message, details);
  }

  static providerNotConfigured(message: string, details?: Record<string, unknown>): ModelConfigError {
    return new ModelConfigError('PROVIDER_NOT_CONFIGURED', message, details);
  }

  toJSON(): { type: ErrorType; message: string; retryable: boolean; details?: Record<string, unknown> } {
    return {
      type: this.type,
      message: this.message,
      retryable: this.retryable,
      details: this.details
    };
  }
}

export function isModelConfigError(error: unknown): error is ModelConfigError {
  return error instanceof ModelConfigError;
}
