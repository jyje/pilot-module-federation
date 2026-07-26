import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { tokensCssPath } from '../src/index';

const css = readFileSync(fileURLToPath(new URL('../src/tokens.css', import.meta.url)), 'utf-8');
const platformCss = readFileSync(fileURLToPath(new URL('../src/platform.css', import.meta.url)), 'utf-8');

describe('design tokens CSS', () => {
  it('defines every required semantic surface token', () => {
    expect(css).toMatch(/--platform-background:\s*220 45% 6%/);
    expect(css).toMatch(/--platform-surface:\s*221 39% 11%/);
    expect(css).toMatch(/--platform-border:\s*218 31% 20%/);
    expect(css).toMatch(/--platform-foreground:\s*214 56% 91%/);
    expect(css).toMatch(/--platform-muted:/);
    expect(css).toMatch(/--platform-accent:\s*170 62% 52%/);
    expect(css).toMatch(/--platform-warning:\s*40 89% 60%/);
    expect(css).toMatch(/--platform-danger:\s*0 100% 71%/);
  });

  it('declares Manrope Variable and JetBrains Mono Variable font roles', () => {
    expect(css).toMatch(/--font-display:.*Manrope Variable/);
    expect(css).toMatch(/--font-body:.*Manrope Variable/);
    expect(css).toMatch(/--font-mono:.*JetBrains Mono Variable/);
  });

  it('bundles both variable fonts from package dependencies', () => {
    expect(css).toMatch(/@import\s+['"]@fontsource-variable\/manrope['"]/);
    expect(css).toMatch(/@import\s+['"]@fontsource-variable\/jetbrains-mono['"]/);
    expect(css).not.toMatch(/url\(['"]?\.\/fonts\//);
  });

  it('never references a network font CDN', () => {
    expect(css).not.toMatch(/fonts\.googleapis\.com/);
    expect(css).not.toMatch(/fonts\.gstatic\.com/);
    expect(css).not.toMatch(/https?:\/\//);
  });

  it('exports a resolvable tokensCssPath', () => {
    expect(tokensCssPath.endsWith('tokens.css')).toBe(true);
  });

  it('defines a visible focus outline using the accent token', () => {
    expect(css).toMatch(/:focus-visible\s*{[^}]*outline:[^}]*--platform-accent/s);
  });

  it('provides one framework-neutral Flight Deck surface contract', () => {
    expect(platformCss).toMatch(/\.mission-rail/);
    expect(platformCss).toMatch(/\.domain-view/);
    expect(platformCss).toMatch(/\.metrics/);
    expect(platformCss).toMatch(/\.platform-button/);
    expect(platformCss).not.toMatch(/platform-warning/);
  });

  it('disables non-essential motion under prefers-reduced-motion', () => {
    expect(css).toMatch(/@media\s*\(prefers-reduced-motion:\s*reduce\)/);
  });
});
