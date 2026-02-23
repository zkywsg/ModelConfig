import { ModelConfigError } from '../errors/errors.js';
function parseProviderModelRef(modelRef) {
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
export function resolveProviderTarget(envConfig, modelRef) {
    const parsed = parseProviderModelRef(modelRef);
    const providerConfig = envConfig.providers[parsed.provider];
    if (!providerConfig) {
        throw ModelConfigError.providerNotConfigured(`Provider '${parsed.provider}' is not configured in current environment.`, {
            provider: parsed.provider,
            model_ref: modelRef,
            available_providers: Object.keys(envConfig.providers)
        });
    }
    const target = {
        provider: parsed.provider,
        model: parsed.model,
        provider_type: providerConfig.type
    };
    if (typeof providerConfig.base_url === 'string' && providerConfig.base_url.length > 0) {
        target.base_url = providerConfig.base_url;
    }
    if (typeof providerConfig.api_key === 'string' && providerConfig.api_key.length > 0) {
        target.credentials_ref = providerConfig.api_key;
    }
    return target;
}
