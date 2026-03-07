import { getEnvConfig } from '../config/env.js';
import { createCapabilityMatrix } from '../capability/matrix.js';
import { matchCandidatesByCapabilities } from '../capability/matcher.js';
import { ModelConfigError } from '../errors/errors.js';
import { resolveAlias } from '../model/alias.js';
import { resolveLogicalModel } from '../model/logical.js';
import { selectPriorityCandidate } from '../model/selector.js';
import { resolveProviderTarget } from '../provider/registry.js';
export function resolve(config, request) {
    const envName = request.env ?? process.env.AI_ENV ?? 'dev';
    const envConfig = getEnvConfig(config, envName);
    const logical = resolveLogicalModel(envConfig, request.model);
    const capabilityMatrix = createCapabilityMatrix(config);
    const resolvedCandidates = logical.candidates.map((candidate)=>resolveAlias(candidate, config.aliases ?? {}));
    const matchResult = matchCandidatesByCapabilities(capabilityMatrix, resolvedCandidates, request.require ?? []);
    if (matchResult.matched.length === 0) {
        throw ModelConfigError.capabilityMismatch('No models support the required capabilities.', {
            logical_model: logical.logical_model,
            env: envName,
            required: matchResult.required,
            rejected: matchResult.rejected
        });
    }
    const selectedCandidate = selectPriorityCandidate(matchResult.matched);
    const target = resolveProviderTarget(envConfig, selectedCandidate);
    return {
        provider: target.provider,
        model: target.model,
        base_url: target.base_url,
        credentials_ref: target.credentials_ref,
        logical_model: logical.logical_model,
        env: envName,
        metadata: {
            logical_model: logical.logical_model,
            env: envName,
            strategy: logical.strategy,
            required_capabilities: [
                ...request.require ?? []
            ],
            selected_candidate: selectedCandidate
        }
    };
}
