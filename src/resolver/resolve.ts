import { getEnvConfig } from '../config/env.ts';
import { resolveAlias } from '../model/alias.ts';
import { resolveLogicalModel } from '../model/logical.ts';
import { selectPriorityCandidate } from '../model/selector.ts';
import { resolveProviderTarget } from '../provider/registry.ts';
import type { ModelConfig, ResolveRequest, ResolveResult } from '../types.ts';

export function resolve(config: ModelConfig, request: ResolveRequest): ResolveResult {
  const envName = request.env ?? process.env.AI_ENV ?? 'dev';
  const envConfig = getEnvConfig(config, envName);
  const logical = resolveLogicalModel(envConfig, request.model);

  const resolvedCandidates = logical.candidates.map((candidate) => resolveAlias(candidate, config.aliases ?? {}));
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
