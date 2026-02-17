import { ModelConfigError } from '../errors/errors.js';
function parseScalar(raw) {
    const value = raw.trim();
    if (value === 'true') return true;
    if (value === 'false') return false;
    if (value === 'null') return null;
    if (/^-?\d+$/.test(value)) return Number.parseInt(value, 10);
    if (/^-?\d+\.\d+$/.test(value)) return Number.parseFloat(value);
    if (value.startsWith('"') && value.endsWith('"') || value.startsWith("'") && value.endsWith("'")) {
        return value.slice(1, -1);
    }
    return value;
}
function cleanLine(line) {
    const hashIndex = line.indexOf('#');
    const withoutComment = hashIndex >= 0 ? line.slice(0, hashIndex) : line;
    return withoutComment.replace(/\t/g, '  ').trimEnd();
}
export function parseYaml(input) {
    const lines = input.split(/\r?\n/);
    const root = {};
    const stack = [
        {
            indent: -1,
            node: root
        }
    ];
    for(let lineNo = 0; lineNo < lines.length; lineNo += 1){
        const raw = cleanLine(lines[lineNo]);
        if (raw.trim().length === 0) continue;
        const indent = raw.length - raw.trimStart().length;
        const line = raw.trimStart();
        while(stack.length > 1 && indent <= stack[stack.length - 1].indent){
            stack.pop();
        }
        const parent = stack[stack.length - 1]?.node;
        if (line.startsWith('- ')) {
            if (!Array.isArray(parent)) {
                throw ModelConfigError.configInvalid(`Invalid YAML list placement at line ${lineNo + 1}.`);
            }
            const item = line.slice(2).trim();
            if (item.length === 0) {
                const child = {};
                parent.push(child);
                stack.push({
                    indent,
                    node: child
                });
            } else {
                parent.push(parseScalar(item));
            }
            continue;
        }
        const separator = line.indexOf(':');
        if (separator <= 0) {
            throw ModelConfigError.configInvalid(`Invalid YAML syntax at line ${lineNo + 1}.`);
        }
        const key = line.slice(0, separator).trim();
        const value = line.slice(separator + 1).trim();
        if (typeof parent !== 'object' || parent === null || Array.isArray(parent)) {
            throw ModelConfigError.configInvalid(`Invalid YAML object placement at line ${lineNo + 1}.`);
        }
        if (value.length === 0) {
            const nextRaw = cleanLine(lines[lineNo + 1] ?? '');
            const nextTrimmed = nextRaw.trimStart();
            const childNode = nextTrimmed.startsWith('- ') ? [] : {};
            parent[key] = childNode;
            stack.push({
                indent,
                node: childNode
            });
        } else {
            parent[key] = parseScalar(value);
        }
    }
    return root;
}
