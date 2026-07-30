import {
  expect, Locator, Page, test,
} from '@playwright/test';

const panelMargin = 20;

const expectPanelScreenshot = async (page: Page, panel: Locator, name: string): Promise<void> => {
  const panelBounds = await panel.boundingBox();
  const viewport = page.viewportSize();

  if (!panelBounds || !viewport) {
    throw new Error('Expected a visible panel in a configured viewport');
  }

  const clip = {
    x: Math.max(0, panelBounds.x - panelMargin),
    y: Math.max(0, panelBounds.y - panelMargin),
    width: Math.min(viewport.width, panelBounds.x + panelBounds.width + panelMargin)
      - Math.max(0, panelBounds.x - panelMargin),
    height: Math.min(viewport.height, panelBounds.y + panelBounds.height + panelMargin)
      - Math.max(0, panelBounds.y - panelMargin),
  };

  await expect(page).toHaveScreenshot(name, { clip });
};

test.describe('Error and empty-state visual states', () => {
  test.describe.configure({ mode: 'serial' });

  test('renders a no-thread-dumps state', async ({ mount, page }) => {
    const component = await mount('components/Errors/EmptyState/NoThreadDumps');
    const panel = component.getByRole('heading', { name: 'No thread dumps found' }).locator('..');

    await expect(panel).toBeVisible();
    await expectPanelScreenshot(page, panel, 'no-thread-dumps.png');
  });

  test('renders a long empty-state message', async ({ mount, page }) => {
    const component = await mount('components/Errors/EmptyState/UnmatchedCpuUsageData');
    const panel = component.getByRole('heading', { name: 'CPU usage data could not be matched to a thread dump' }).locator('..');

    await expect(panel).toBeVisible();
    await expectPanelScreenshot(page, panel, 'unmatched-cpu-usage-data.png');
  });

  test('renders the retry error', async ({ mount, page }) => {
    const component = await mount('components/Errors/FullPageError/Default');
    const panel = component.locator('.error-indicator');

    await expect(panel).toBeVisible();
    await expectPanelScreenshot(page, panel, 'full-page-error.png');
  });

  test('renders keyboard focus for the retry action', async ({ mount, page }) => {
    const component = await mount('components/Errors/FullPageError/Default');
    const panel = component.locator('.error-indicator');
    const retryButton = component.getByRole('button', { name: 'Try again' });

    await page.keyboard.press('Tab');
    await expect(retryButton).toBeFocused();
    await expectPanelScreenshot(page, panel, 'full-page-error-focused.png');
  });
});
