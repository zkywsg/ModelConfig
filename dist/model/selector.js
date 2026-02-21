import { ModelConfigError } from '../errors/errors.js';
function isValidProviderModelRef(candidate) {
    const separator = candidate.indexOf(':');
    return separator > 0 && separator < candidate.length - 1;
}
export function selectPriorityCandidate(candidates) {
    if (!Array.isArray(candidates) || candidates.length === 0) {
        throw ModelConfigError.modelNotFound('No candidates available for priority selection.', {
            candidates
        });
    }
    for (const candidate of candidates){
        if (typeof candidate === 'string' && isValidProviderModelRef(candidate)) {
            return candidate;
        }
    }
    throw ModelConfigError.modelNotFound('No valid provider:model candidate found for priority selection.', {
        candidates
    });
}
