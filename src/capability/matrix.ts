import type { Capability, CapabilityMatrix, ModelConfig } from '../types.ts';

const BUILT_IN_CAPABILITIES: Record<string, Capability[]> = {
  'openai:gpt-4o': ['vision', 'json_output', 'tools', 'streaming'],
  'openai:text-embedding-3-large': ['embeddings'],
  'anthropic:claude-sonnet': ['vision', 'tools', 'streaming'],
  'local:llama3': ['streaming']
};

export function createBuiltInCapabilityMatrix(): CapabilityMatrix {
  const matrix: CapabilityMatrix = new Map();

  for (const [modelRef, capabilities] of Object.entries(BUILT_IN_CAPABILITIES)) {
    matrix.set(modelRef, new Set(capabilities));
  }

  return matrix;
}

export function applyCapabilityOverrides(
  baseMatrix: CapabilityMatrix,
  overrides: ModelConfig['capabilities'] extends { overrides?: infer T } ? T : never
): CapabilityMatrix {
  const merged: CapabilityMatrix = new Map();

  for (const [modelRef, capabilities] of baseMatrix.entries()) {
    merged.set(modelRef, new Set(capabilities));
  }

  if (!overrides) {
    return merged;
  }

  for (const [modelRef, capabilities] of Object.entries(overrides)) {
    merged.set(modelRef, new Set(capabilities));
  }

  return merged;
}

export function createCapabilityMatrix(config?: ModelConfig): CapabilityMatrix {
  const builtIn = createBuiltInCapabilityMatrix();
  return applyCapabilityOverrides(builtIn, config?.capabilities?.overrides);
}

export function getCapabilitiesForModel(matrix: CapabilityMatrix, modelRef: string): Set<Capability> {
  return new Set(matrix.get(modelRef) ?? []);
}

export function modelSupportsCapabilities(
  matrix: CapabilityMatrix,
  modelRef: string,
  required: Capability[]
): boolean {
  if (required.length === 0) {
    return true;
  }

  const supported = matrix.get(modelRef);
  if (!supported) {
    return false;
  }

  return required.every((capability) => supported.has(capability));
}

export function getCapabilitySources(config?: ModelConfig): string[] {
  const sources = config?.capabilities?.sources;
  if (!Array.isArray(sources) || sources.length === 0) {
    return ['built-in'];
  }
  return [...sources];
}
