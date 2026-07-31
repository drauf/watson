import { Page, expect } from '@playwright/test';
import { test } from './e2e-common';

const waitForAnimationToFinish = async (page: Page): Promise<void> => {
  await page.getByText('root').first().isVisible();
};

test.describe('Flame graph', () => {
  test.beforeEach(async ({ pageWithData }) => {
    await pageWithData.getByText('Flame graph').click();
    await waitForAnimationToFinish(pageWithData);
  });

  test('loads', async ({ pageWithData }) => {
    await expect(pageWithData).toHaveScreenshot('Flame-graph-loads-1.png');
  });

  test('allows zooming', async ({ pageWithData }) => {
    await pageWithData.getByText('IssueRequiredExecutor').first().click({ force: true });

    await expect(pageWithData).toHaveScreenshot('Flame-graph-allows-zooming-1.png');
  });
});
