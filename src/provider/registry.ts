import { ModelConfigError } from '../errors/errors.ts';
import type { EnvironmentConfig, ProviderTarget } from '../types.ts';

const OPENAI_DEFAULT_BASE_URL = 'https://api.openai.com/v1';

function parseProviderModelRef(modelRef: string): { provider: string; model: string } {
  const separator = modelRef.indexOf(':');

  if (separator <= 0 || separator >= modelRef.length - 1) {
    throw ModelConfigError.configInvalid(`Invalid provider model reference '${modelRef}'. Expected 'provider:model'.`, {
      model_ref: modelRef
    });
  }

  return {
    provider: modelRef.slice(0, separator),
    model: modelRef.slice(separator + 1)
  };
}

export function resolveProviderTarget(envConfig: EnvironmentConfig, modelRef: string): ProviderTarget {
  const parsed = parseProviderModelRef(modelRef);
  const providerConfig = envConfig.providers[parsed.provider];

  if (!providerConfig) {
    throw ModelConfigError.providerNotConfigured(`Provider '${parsed.provider}' is not configured in current environment.`, {
      provider: parsed.provider,
      model_ref: modelRef,
      available_providers: Object.keys(envConfig.providers)
    });
  }

  const target: ProviderTarget = {
    provider: parsed.provider,
    model: parsed.model,
    provider_type: providerConfig.type
  };

  if (providerConfig.type === 'openai') {
    target.base_url =
      typeof providerConfig.base_url === 'string' && providerConfig.base_url.length > 0
        ? providerConfig.base_url
        : OPENAI_DEFAULT_BASE_URL;
  } else if (typeof providerConfig.base_url === 'string' && providerConfig.base_url.length > 0) {
    target.base_url = providerConfig.base_url;
  }

  if (typeof providerConfig.api_key === 'string' && providerConfig.api_key.length > 0) {
    target.credentials_ref = providerConfig.api_key;
  }

  return target;
}
