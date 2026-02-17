import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, extname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { stripTypeScriptTypes } from 'node:module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');
const srcDir = join(rootDir, 'src');
const distDir = join(rootDir, 'dist');

rmSync(distDir, { recursive: true, force: true });
mkdirSync(distDir, { recursive: true });

if (!existsSync(srcDir)) {
  console.log('No src directory found. Build finished with empty dist/.');
  process.exit(0);
}

function transpileTs(source) {
  const stripped = stripTypeScriptTypes(source, { mode: 'transform' });
  return stripped.replace(/(from\s+['"][^'"]+)\.ts(['"])/g, '$1.js$2');
}

function copyTree(currentPath) {
  for (const entry of readdirSync(currentPath)) {
    const inputPath = join(currentPath, entry);
    const stats = statSync(inputPath);

    if (stats.isDirectory()) {
      copyTree(inputPath);
      continue;
    }

    const relPath = relative(srcDir, inputPath);
    const outPath = join(distDir, relPath.replace(/\.ts$/, '.js'));
    mkdirSync(dirname(outPath), { recursive: true });

    if (extname(entry) === '.ts') {
      writeFileSync(outPath, transpileTs(readFileSync(inputPath, 'utf8')), 'utf8');
    } else {
      cpSync(inputPath, outPath);
    }
  }
}

copyTree(srcDir);
console.log('Build complete:', distDir);
