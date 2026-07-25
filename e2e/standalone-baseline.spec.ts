import { expect, test } from '@playwright/test';
import { NEXT_STANDALONE, VUE_STANDALONE } from './origins';

for (const [label, origin] of [
  ['Vue Standalone', VUE_STANDALONE],
  ['Next Standalone', NEXT_STANDALONE],
] as const) {
  test.describe(`${label} — non-composed baseline`, () => {
    test('renders context controls and the monitor for the default context', async ({ page }) => {
      await page.goto(origin);
      await expect(page.getByText('Cluster')).toBeVisible();
      await expect(page.getByText('Model X', { exact: true })).toBeVisible();
      await expect(page.getByText('No events yet.')).toBeVisible();
    });

    test('selecting a deployment records an entry in the on-page event ledger', async ({ page }) => {
      await page.goto(origin);
      const nodes = page.getByRole('button', { name: /Model X/ });
      await nodes.nth(1).click();

      const entry = page.getByTestId('ledger-entry').first();
      await expect(entry).toContainText('Deployment selected');
      await expect(entry).toContainText('deploy-002');
    });
  });
}
