import { existsSync, readFileSync } from 'node:fs';
import { extname, resolve } from 'node:path';
import { ModelConfigError } from '../errors/errors.js';
import { parseYaml } from './yaml.js';
const DEFAULT_FILES = [
    'modelconfig.yaml',
    'modelconfig.yml',
    'modelconfig.json'
];
function resolveConfigPath(inputPath) {
    if (inputPath) {
        return resolve(inputPath);
    }
    for (const fileName of DEFAULT_FILES){
        const filePath = resolve(fileName);
        if (existsSync(filePath)) return filePath;
    }
    throw ModelConfigError.configInvalid('Config file not found.');
}
function parseContent(content, filePath) {
    const ext = extname(filePath).toLowerCase();
    try {
        if (ext === '.json') {
            return JSON.parse(content);
        }
        if (ext === '.yaml' || ext === '.yml') {
            return parseYaml(content);
        }
        try {
            return JSON.parse(content);
        } catch  {
            return parseYaml(content);
        }
    } catch (error) {
        if (error instanceof ModelConfigError) {
            throw error;
        }
        throw ModelConfigError.configInvalid(`Failed to parse config: ${filePath}`, {
            cause: error instanceof Error ? error.message : String(error)
        });
    }
}
export function loadConfig(inputPath) {
    const filePath = resolveConfigPath(inputPath);
    const content = readFileSync(filePath, 'utf8');
    const parsed = parseContent(content, filePath);
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
        throw ModelConfigError.configInvalid('Config root must be an object.');
    }
    return parsed;
}
