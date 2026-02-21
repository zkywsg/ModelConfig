import { ModelConfigError } from '../errors/errors.ts';

function isProviderModelRef(value: string): boolean {
  const sep = value.indexOf(':');
  return sep > 0 && sep < value.length - 1;
}

export function resolveAlias(modelRef: string, aliases: Record<string, string> = {}): string {
  const visited = new Set<string>();
  let current = modelRef;
  let traversed = false;

  while (aliases[current] !== undefined) {
    if (visited.has(current)) {
      throw ModelConfigError.aliasNotFound(`Alias cycle detected from '${modelRef}'.`, {
        model: modelRef,
        current_alias: current,
        visited: [...visited, current]
      });
    }

    visited.add(current);
    traversed = true;
    current = aliases[current];
  }

  if (traversed && !isProviderModelRef(current)) {
    throw ModelConfigError.aliasNotFound(`Alias '${modelRef}' resolved to invalid target '${current}'.`, {
      model: modelRef,
      target: current
    });
  }

  return current;
}
