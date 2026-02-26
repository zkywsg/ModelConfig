const BUILT_IN_CAPABILITIES = {
    'openai:gpt-4o': [
        'vision',
        'json_output',
        'tools',
        'streaming'
    ],
    'openai:text-embedding-3-large': [
        'embeddings'
    ],
    'anthropic:claude-sonnet': [
        'vision',
        'tools',
        'streaming'
    ],
    'local:llama3': [
        'streaming'
    ]
};
export function createBuiltInCapabilityMatrix() {
    const matrix = new Map();
    for (const [modelRef, capabilities] of Object.entries(BUILT_IN_CAPABILITIES)){
        matrix.set(modelRef, new Set(capabilities));
    }
    return matrix;
}
export function getCapabilitiesForModel(matrix, modelRef) {
    return new Set(matrix.get(modelRef) ?? []);
}
export function modelSupportsCapabilities(matrix, modelRef, required) {
    if (required.length === 0) {
        return true;
    }
    const supported = matrix.get(modelRef);
    if (!supported) {
        return false;
    }
    return required.every((capability)=>supported.has(capability));
}
export function getCapabilitySources(config) {
    const sources = config?.capabilities?.sources;
    if (!Array.isArray(sources) || sources.length === 0) {
        return [
            'built-in'
        ];
    }
    return [
        ...sources
    ];
}
