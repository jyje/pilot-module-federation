import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const consumers = [
  '../../../vue/host/src/style.css',
  '../../../vue/observability/src/main.ts',
  '../../../vue/governance/src/main.ts',
  '../../../next/host/app/globals.css',
  '../../../next/remote/app/globals.css',
  '../../../next/governance/app/globals.css',
];

const buttonConsumers = [
  '../../../vue/host/src/components/ui/button/index.ts',
  '../../../next/host/components/ui/button.tsx',
  '../../../next/remote/components/ui/button.tsx',
  '../../../next/governance/components/ui/button.tsx',
];

describe('Flight Deck CSS consumers', () => {
  it.each(consumers)('%s imports the shared platform surface contract', (consumer) => {
    const source = readFileSync(fileURLToPath(new URL(consumer, import.meta.url)), 'utf-8');
    expect(source).toContain('@pilot/design-tokens/platform.css');
  });

  it.each(buttonConsumers)('%s uses the common button surface instead of local visual utilities', (consumer) => {
    const source = readFileSync(fileURLToPath(new URL(consumer, import.meta.url)), 'utf-8');
    expect(source).toContain('platform-button');
    expect(source).not.toMatch(/(?:rounded-|h-9|bg-\[hsl|px-3|text-sm|font-semibold)/);
  });
});
