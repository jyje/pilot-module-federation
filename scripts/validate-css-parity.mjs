import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';

const artifactDir = new URL('../artifacts/validation/', import.meta.url);
await mkdir(artifactDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const expected = ['display', 'height', 'padding', 'border', 'borderRadius', 'backgroundColor', 'color', 'fontFamily', 'fontSize', 'fontWeight'];

async function signIn(page, url) {
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.getByLabel('Name').fill('CSS verifier');
  await page.getByLabel('Email').fill('css@aurora.example');
  await page.getByLabel('Password').fill('arbitrary-password');
  const button = page.getByRole('button', { name: 'Sign in' });
  const login = await styleOf(button);
  await button.click();
  return login;
}

async function styleOf(locator) {
  return locator.evaluate((element) => {
    const style = getComputedStyle(element);
    return { className: element.className, ...Object.fromEntries(['display', 'height', 'padding', 'border', 'borderRadius', 'backgroundColor', 'color', 'fontFamily', 'fontSize', 'fontWeight'].map((property) => [property, style[property]])) };
  });
}

const vue = await browser.newPage();
const vueLogin = await signIn(vue, 'http://127.0.0.1:3000/');
const vueStyles = {
  login: vueLogin,
  navigation: await styleOf(vue.getByRole('button', { name: 'Deployments', exact: true })),
  signOut: await styleOf(vue.getByRole('button', { name: 'Sign out', exact: true })),
  deployments: await styleOf(vue.getByTestId('deployments-hello')),
};
await vue.getByRole('button', { name: 'Observability', exact: true }).click();
await vue.getByTestId('observability-remote').waitFor();
vueStyles.observability = await styleOf(vue.getByTestId('observability-hello'));
await vue.getByRole('button', { name: 'Governance', exact: true }).click();
await vue.getByTestId('governance-remote').waitFor();
vueStyles.governance = await styleOf(vue.getByTestId('governance-hello'));

const next = await browser.newPage();
const nextLogin = await signIn(next, 'http://127.0.0.1:4000/');
const nextStyles = {
  login: nextLogin,
  navigation: await styleOf(next.getByRole('button', { name: 'Deployments', exact: true })),
  signOut: await styleOf(next.getByRole('button', { name: 'Sign out', exact: true })),
  deployments: await styleOf(next.getByTestId('next-deployments-hello')),
};
await next.getByRole('button', { name: 'Observability', exact: true }).click();
await next.getByTestId('next-observability-hello').waitFor();
nextStyles.observability = await styleOf(next.getByTestId('next-observability-hello'));
await next.getByRole('button', { name: 'Governance', exact: true }).click();
await next.getByTestId('next-governance-remote').waitFor();
nextStyles.governance = await styleOf(next.getByTestId('next-governance-hello'));

const snapshots = { vue: vueStyles, next: nextStyles };
for (const surface of Object.keys(vueStyles)) for (const property of expected) if (vueStyles[surface][property] !== nextStyles[surface][property]) throw new Error(`${surface}: Vue ${property} is ${vueStyles[surface][property]}, Next is ${nextStyles[surface][property]}`);
for (const surface of ['observability', 'governance']) for (const property of expected) if (vueStyles.deployments[property] !== vueStyles[surface][property]) throw new Error(`Vue ${surface}: ${property} differs from deployments`);
for (const surface of ['observability', 'governance']) for (const property of expected) if (nextStyles.deployments[property] !== nextStyles[surface][property]) throw new Error(`Next ${surface}: ${property} differs from deployments`);

await writeFile(new URL('css-parity.json', artifactDir), `${JSON.stringify(snapshots, null, 2)}\n`);
await browser.close();
console.log(JSON.stringify(snapshots, null, 2));
