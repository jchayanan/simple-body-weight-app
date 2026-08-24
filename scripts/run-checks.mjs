import { execFileSync } from 'node:child_process';
import { mkdtempSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const checks = readdirSync(join(root, 'src', 'lib')).filter((file) => file.endsWith('.check.ts')).sort();
const output = mkdtempSync(join(tmpdir(), 'simple-bodyweight-checks-'));
const compiler = join(root, 'node_modules', 'typescript', 'bin', 'tsc');

execFileSync(process.execPath, [compiler, '--target', 'es2022', '--module', 'commonjs', '--moduleResolution', 'node', '--types', 'node', '--outDir', output, ...checks.map((file) => join(root, 'src', 'lib', file))], { cwd: root, stdio: 'inherit' });
for (const check of checks) execFileSync(process.execPath, [join(output, check.replace(/\.ts$/, '.js'))], { cwd: root, stdio: 'inherit' });

console.info(`${checks.length} logic checks passed.`);
