import { expect, test } from '@playwright/test';
import { NEXT_REMOTE, VUE_REMOTE } from './origins';

for (const [label, origin, title] of [
  ['Vue Remote', VUE_REMOTE, 'Vue Remote'],
  ['Next Remote', NEXT_REMOTE, 'Next Remote'],
] as const) {
  test.describe(`${label} — directly previewable`, () => {
    test('renders the default deployment with health, replicas, and latency', async ({ page }) => {
      await page.goto(origin);
      await expect(page.getByRole('heading', { name: title })).toBeVisible();
      await expect(page.getByText('Model X')).toBeVisible();
      await expect(page.getByText('healthy')).toBeVisible();
      await expect(page.getByText('4/4')).toBeVisible();
    });

    test('selecting the degraded deployment shows an acknowledgable alert', async ({ page }) => {
      await page.goto(origin);
      const nodes = page.getByRole('button', { name: /Model X/ });
      await nodes.nth(1).click();
      await expect(page.getByText('degraded', { exact: true })).toBeVisible();
      const ack = page.getByTestId('acknowledge-alert');
      await expect(ack).toBeVisible();
      await ack.click();
      await expect(ack).toHaveCount(0);
    });
  });
}
