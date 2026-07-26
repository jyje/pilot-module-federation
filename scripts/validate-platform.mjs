import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';

const artifactDir = new URL('../artifacts/validation/', import.meta.url);
await mkdir(artifactDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 980 }, deviceScaleFactor: 1 });
const logs = [];
const apiResponses = [];

page.on('console', (message) => {
  if (message.type() === 'info' && message.text().startsWith('[')) logs.push(message.text());
});
page.on('response', (response) => {
  const url = new URL(response.url());
  if (url.pathname.startsWith('/api/')) apiResponses.push(`${response.status()} ${url.pathname}`);
});

await page.goto('http://127.0.0.1:3000/', { waitUntil: 'networkidle' });
await page.getByLabel('Name').fill('Jiyoon Park');
await page.getByLabel('Email').fill('alex@aurora.example');
await page.getByLabel('Password').fill('arbitrary-password');
await page.getByRole('button', { name: 'Sign in' }).click();

const routes = [
  ['deployments', 'Deployments', 'deployments-host'],
  ['observability', 'Observability', 'observability-remote'],
  ['governance', 'Governance', 'governance-remote'],
];

for (const [id, label, testId] of routes) {
  console.log(`validating ${id}`);
  await page.getByRole('button', { name: label, exact: true }).click();
  await page.getByTestId(testId).waitFor({ state: 'visible' });
  await page.getByTestId(`${id}-hello`).click();
  await page.getByRole('status').filter({ hasText: 'Hello,' }).waitFor({ state: 'visible' });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: new URL(`${id}.png`, artifactDir).pathname, fullPage: true });
}

await writeFile(new URL('browser-log.json', artifactDir), `${JSON.stringify({ logs, apiResponses }, null, 2)}\n`);
await browser.close();

console.log(JSON.stringify({ logs, apiResponses }, null, 2));
