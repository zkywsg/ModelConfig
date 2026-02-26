import { modelSupportsCapabilities } from './matrix.js';
function missingCapabilities(matrix, candidate, required) {
    const supported = matrix.get(candidate);
    if (!supported) {
        return [
            ...required
        ];
    }
    return required.filter((capability)=>!supported.has(capability));
}
export function matchCandidatesByCapabilities(matrix, candidates, required = []) {
    if (required.length === 0) {
        return {
            matched: [
                ...candidates
            ],
            rejected: [],
            required: []
        };
    }
    const matched = [];
    const rejected = [];
    for (const candidate of candidates){
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
        required: [
            ...required
        ]
    };
}
