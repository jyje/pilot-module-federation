import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const APP_ROOT = join(__dirname, '..');
const SELF = join(__dirname, 'architecture-guard.test.ts');

const SOURCE_DIRS = ['app', 'components', 'lib', 'test'];
const CONFIG_FILES = ['package.json', 'next.config.ts', 'tsconfig.json', 'components.json'];

function listFilesRecursive(dir: string): string[] {
  const entries = readdirSync(dir);
  const files: string[] = [];
  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const stats = statSync(fullPath);
    if (stats.isDirectory()) {
      if (entry === 'node_modules' || entry === '.next') continue;
      files.push(...listFilesRecursive(fullPath));
    } else {
      files.push(fullPath);
    }
  }
  return files;
}

function allSourceAndConfigFiles(): string[] {
  const files: string[] = [];
  for (const dir of SOURCE_DIRS) {
    files.push(...listFilesRecursive(join(APP_ROOT, dir)));
  }
  for (const file of CONFIG_FILES) {
    files.push(join(APP_ROOT, file));
  }
  return files.filter((file) => file !== SELF);
}

describe('Next Standalone architectural guard', () => {
  it('imports nothing from next/remote or next/host source', () => {
    const offenders = allSourceAndConfigFiles().filter((file) => {
      const content = readFileSync(file, 'utf-8');
      return /next\/remote|next\/host|['"](\.\.\/)+(remote|host)\//.test(content);
    });
    expect(offenders).toEqual([]);
  });

  it('does not depend on or configure @module-federation', () => {
    const offenders = allSourceAndConfigFiles().filter((file) => {
      const content = readFileSync(file, 'utf-8');
      return /@module-federation/.test(content);
    });
    expect(offenders).toEqual([]);
  });

  it('does not render an iframe element', () => {
    const sourceFiles = [...listFilesRecursive(join(APP_ROOT, 'app')), ...listFilesRecursive(join(APP_ROOT, 'components'))].filter(
      (file) => file.endsWith('.tsx'),
    );
    const offenders = sourceFiles.filter((file) => /<iframe/i.test(readFileSync(file, 'utf-8')));
    expect(offenders).toEqual([]);
  });

  it('does not send or receive postMessage', () => {
    const sourceFiles = [
      ...listFilesRecursive(join(APP_ROOT, 'app')),
      ...listFilesRecursive(join(APP_ROOT, 'components')),
      ...listFilesRecursive(join(APP_ROOT, 'lib')),
    ];
    const offenders = sourceFiles.filter((file) => /postMessage/.test(readFileSync(file, 'utf-8')));
    expect(offenders).toEqual([]);
  });
});
