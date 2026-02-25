import { getEnvConfig } from '../config/env.js';
import { resolveAlias } from '../model/alias.js';
import { resolveLogicalModel } from '../model/logical.js';
import { selectPriorityCandidate } from '../model/selector.js';
import { resolveProviderTarget } from '../provider/registry.js';
export function resolve(config, request) {
    const envName = request.env ?? process.env.AI_ENV ?? 'dev';
    const envConfig = getEnvConfig(config, envName);
    const logical = resolveLogicalModel(envConfig, request.model);
    const resolvedCandidates = logical.candidates.map((candidate)=>resolveAlias(candidate, config.aliases ?? {}));
    const selectedCandidate = selectPriorityCandidate(resolvedCandidates);
    const target = resolveProviderTarget(envConfig, selectedCandidate);
    return {
        provider: target.provider,
        model: target.model,
        base_url: target.base_url,
        credentials_ref: target.credentials_ref,
        logical_model: logical.logical_model,
        env: envName
    };
}
