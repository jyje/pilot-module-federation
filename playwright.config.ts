import { defineConfig, devices } from '@playwright/test';

const REUSE_EXISTING = !process.env.CI;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: 'list',
  use: {
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: [
    {
      command: 'pnpm preview',
      cwd: 'vue/host',
      url: 'http://127.0.0.1:4173/',
      reuseExistingServer: REUSE_EXISTING,
      timeout: 30_000,
    },
    {
      command: 'pnpm preview',
      cwd: 'vue/remote',
      url: 'http://127.0.0.1:4174/',
      reuseExistingServer: REUSE_EXISTING,
      timeout: 30_000,
    },
    {
      command: 'pnpm preview',
      cwd: 'vue/standalone',
      url: 'http://127.0.0.1:4175/',
      reuseExistingServer: REUSE_EXISTING,
      timeout: 30_000,
    },
    {
      command: 'pnpm start',
      cwd: 'next/host',
      url: 'http://127.0.0.1:3000/',
      reuseExistingServer: REUSE_EXISTING,
      timeout: 30_000,
    },
    {
      command: 'pnpm start',
      cwd: 'next/remote',
      url: 'http://127.0.0.1:3001/',
      reuseExistingServer: REUSE_EXISTING,
      timeout: 30_000,
    },
    {
      command: 'pnpm start',
      cwd: 'next/standalone',
      url: 'http://127.0.0.1:3002/',
      reuseExistingServer: REUSE_EXISTING,
      timeout: 30_000,
    },
  ],
});
