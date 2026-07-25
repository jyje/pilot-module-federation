import { expect, test } from '@playwright/test';
import { VUE_HOST } from './origins';

test.describe('Vue Host — Federation composition', () => {
  test('loads the federated Monitor by default and records a Host ledger entry on selection', async ({ page }) => {
    await page.goto(VUE_HOST);
    await expect(page.getByTestId('composition-boundary')).toContainText('Federation component boundary');

    const nodes = page.getByRole('button', { name: /Model X/ });
    await nodes.nth(1).click();

    const entry = page.getByTestId('ledger-entry').first();
    await expect(entry).toContainText('federation');
    await expect(entry).toContainText('deploy-002');
  });
});

test.describe('Vue Host — iframe composition', () => {
  test('embeds the Remote at its exact origin and records a Host ledger entry on selection', async ({ page }) => {
    await page.goto(VUE_HOST);
    await page.getByRole('tab', { name: 'iframe' }).click();
    await expect(page.getByTestId('composition-boundary')).toContainText('iframe document boundary');

    const frameLocator = page.frameLocator('[data-testid="remote-iframe"]');
    await expect(frameLocator.getByText('Model X')).toBeVisible();

    await frameLocator.getByRole('button', { name: /Model X/ }).nth(1).click();

    const entry = page.getByTestId('ledger-entry').first();
    await expect(entry).toContainText('iframe');
    await expect(entry).toContainText('deploy-002');
  });
});
