import { expect, test } from '@playwright/test';
import { NEXT_HOST, NEXT_REMOTE, VUE_HOST, VUE_REMOTE } from './origins';

test.describe('iframe Remote unavailable → fallback → retry recovery', () => {
  for (const [label, hostOrigin, remoteOrigin, switchToIframe] of [
    ['Vue Host', VUE_HOST, VUE_REMOTE, true],
    ['Next Host', NEXT_HOST, NEXT_REMOTE, false],
  ] as const) {
    test(`${label}: shows a timeout fallback when the Remote is unreachable, then recovers on Retry`, async ({
      page,
    }) => {
      let blockRemote = true;
      await page.route(`${remoteOrigin}/**`, (route) => (blockRemote ? route.abort() : route.continue()));

      await page.goto(hostOrigin);
      if (switchToIframe) {
        await page.getByRole('tab', { name: 'iframe' }).click();
      }

      await expect(page.getByTestId('iframe-error')).toBeVisible({ timeout: 12_000 });
      await expect(page.getByTestId('iframe-retry')).toBeVisible();

      blockRemote = false;
      await page.getByTestId('iframe-retry').click();

      await expect(page.getByTestId('iframe-error')).toHaveCount(0);
      const frameLocator = page.frameLocator('[data-testid="remote-iframe"]');
      await expect(frameLocator.getByText('Model X')).toBeVisible();
    });
  }
});

test.describe('Federation Remote unavailable → fallback → retry recovery', () => {
  test('Vue Host: Federation mode shows a fallback when remoteEntry.js is unreachable, then recovers on Retry', async ({
    page,
  }) => {
    let blockRemote = true;
    await page.route(`${VUE_REMOTE}/**`, (route) => (blockRemote ? route.abort() : route.continue()));

    await page.goto(VUE_HOST);
    await expect(page.getByTestId('composition-boundary')).toContainText('Federation component boundary');

    await expect(page.getByTestId('federation-error')).toBeVisible({ timeout: 12_000 });

    blockRemote = false;
    await page.getByTestId('federation-retry').click();

    await expect(page.getByText('Model X')).toBeVisible({ timeout: 12_000 });
  });

  test('Next Host: Federation mode shows a fallback when remoteEntry.js is unreachable, then recovers on Retry', async ({
    page,
  }) => {
    let blockRemote = true;
    await page.route(`${NEXT_REMOTE}/**`, (route) => (blockRemote ? route.abort() : route.continue()));

    await page.goto(NEXT_HOST);
    await page.getByRole('tab', { name: 'Federation' }).click();
    await expect(page.getByTestId('composition-boundary')).toContainText('Federation component boundary');

    await expect(page.getByTestId('federation-error')).toBeVisible({ timeout: 12_000 });

    blockRemote = false;
    await page.getByTestId('federation-retry').click();

    await expect(page.getByText('Model X')).toBeVisible({ timeout: 12_000 });
  });
});
