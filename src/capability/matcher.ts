import type { Capability, CapabilityMatrix } from '../types.ts';
import { modelSupportsCapabilities } from './matrix.ts';

export interface CapabilityMatchResult {
  matched: string[];
  rejected: Array<{
    candidate: string;
    missing: Capability[];
  }>;
  required: Capability[];
}

function missingCapabilities(matrix: CapabilityMatrix, candidate: string, required: Capability[]): Capability[] {
  const supported = matrix.get(candidate);
  if (!supported) {
    return [...required];
  }

  return required.filter((capability) => !supported.has(capability));
}

export function matchCandidatesByCapabilities(
  matrix: CapabilityMatrix,
  candidates: string[],
  required: Capability[] = []
): CapabilityMatchResult {
  if (required.length === 0) {
    return {
      matched: [...candidates],
      rejected: [],
      required: []
    };
  }

  const matched: string[] = [];
  const rejected: CapabilityMatchResult['rejected'] = [];

  for (const candidate of candidates) {
    if (modelSupportsCapabilities(matrix, candidate, required)) {
      matched.push(candidate);
      continue;
    }

    rejected.push({
      candidate,
      missing: missingCapabilities(matrix, candidate, required)
    });
  }

  return {
    matched,
    rejected,
    required: [...required]
  };
}
