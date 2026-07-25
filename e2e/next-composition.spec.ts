import { expect, test } from '@playwright/test';
import { NEXT_HOST } from './origins';

test.describe('Next Host — iframe composition', () => {
  test('embeds the Remote by default and records a Host ledger entry on selection', async ({ page }) => {
    await page.goto(NEXT_HOST);
    await expect(page.getByTestId('composition-boundary')).toContainText('iframe document boundary');

    const frameLocator = page.frameLocator('[data-testid="remote-iframe"]');
    await expect(frameLocator.getByText('Model X')).toBeVisible();

    await frameLocator.getByRole('button', { name: /Model X/ }).nth(1).click();

    const entry = page.getByTestId('ledger-entry').first();
    await expect(entry).toContainText('iframe');
    await expect(entry).toContainText('deploy-002');
  });
});

test.describe('Next Host — Federation composition', () => {
  test('loads the federated Monitor via raw webpack Module Federation and records a Host ledger entry', async ({
    page,
  }) => {
    await page.goto(NEXT_HOST);
    await page.getByRole('tab', { name: 'Federation' }).click();
    await expect(page.getByTestId('composition-boundary')).toContainText('Federation component boundary');

    await expect(page.getByText('Model X')).toBeVisible();

    await page.getByRole('button', { name: /Model X/ }).nth(1).click();

    const entry = page.getByTestId('ledger-entry').first();
    await expect(entry).toContainText('federation');
    await expect(entry).toContainText('deploy-002');
  });
});
