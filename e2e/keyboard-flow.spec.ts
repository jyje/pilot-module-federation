import { expect, test, type Locator, type Page } from '@playwright/test';
import { NEXT_HOST, VUE_HOST } from './origins';

type CompositionMode = 'federation' | 'iframe';

interface KeyboardFlowTarget {
  framework: 'Vue' | 'Next';
  host: string;
  /** The mode each Host boots into by default, so the test knows which arrow key reaches the other tab. */
  defaultMode: CompositionMode;
}

const TARGETS: readonly KeyboardFlowTarget[] = [
  { framework: 'Vue', host: VUE_HOST, defaultMode: 'federation' },
  { framework: 'Next', host: NEXT_HOST, defaultMode: 'iframe' },
];

const MODES: readonly CompositionMode[] = ['federation', 'iframe'];

/** Both frameworks' composition boundary carries this substring per mode; see FederationPanel/IframePanel. */
const BOUNDARY_TEXT: Record<CompositionMode, string> = {
  federation: 'Federation component boundary',
  iframe: 'iframe document boundary',
};

/**
 * Returns the scope to query Monitor content in: the page itself for Federation
 * (same-document boundary), or the framed document for iframe (cross-document boundary).
 */
function monitorScope(page: Page, mode: CompositionMode): Page | ReturnType<Page['frameLocator']> {
  return mode === 'iframe' ? page.frameLocator('[data-testid="remote-iframe"]') : page;
}

async function switchCompositionTabByKeyboard(page: Page, targetMode: CompositionMode): Promise<void> {
  const tablist = page.getByRole('tablist', { name: 'Composition mode' });
  const selectedTab = tablist.getByRole('tab', { selected: true });
  const currentText = (await selectedTab.textContent())?.trim().toLowerCase();
  const currentMode: CompositionMode = currentText === 'federation' ? 'federation' : 'iframe';

  if (currentMode === targetMode) {
    return;
  }

  await selectedTab.focus();
  await page.keyboard.press('ArrowRight');

  const nowSelected = tablist.getByRole('tab', { selected: true });
  await expect(nowSelected).toHaveText(new RegExp(targetMode, 'i'));
}

async function selectDegradedDeploymentByKeyboard(scope: Page | ReturnType<Page['frameLocator']>): Promise<Locator> {
  const degradedNode = scope.getByRole('button', { name: /degraded/i }).first();
  await degradedNode.focus();
  await degradedNode.press('Enter');
  return degradedNode;
}

for (const target of TARGETS) {
  for (const mode of MODES) {
    test.describe(`${target.framework} Host — keyboard-only flow — ${mode}`, () => {
      test('switches composition mode, selects a degraded deployment, and acknowledges its alert — all via keyboard', async ({
        page,
      }) => {
        await page.goto(target.host);
        await switchCompositionTabByKeyboard(page, mode);
        await expect(page.getByTestId('composition-boundary')).toContainText(BOUNDARY_TEXT[mode]);

        const scope = monitorScope(page, mode);
        const degradedNode = await selectDegradedDeploymentByKeyboard(scope);
        await expect(degradedNode).toHaveAttribute('aria-pressed', 'true');

        const selectionEntry = page.getByTestId('ledger-entry').first();
        await expect(selectionEntry).toContainText(mode);
        await expect(selectionEntry).toContainText('deploy-002');

        const acknowledgeButton = scope.getByRole('button', { name: 'Acknowledge' });
        await acknowledgeButton.focus();
        await acknowledgeButton.press('Enter');

        const acknowledgeEntry = page.getByTestId('ledger-entry').first();
        await expect(acknowledgeEntry).toContainText('Alert acknowledged');
        await expect(acknowledgeEntry).toContainText('deploy-002');
        await expect(scope.getByRole('button', { name: 'Acknowledge' })).toHaveCount(0);
      });
    });
  }
}
