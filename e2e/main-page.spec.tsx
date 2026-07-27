import { expect } from '@playwright/test';
import { test } from './e2e-common';
import { waitForChartsToSettle } from './helpers/recharts';

test.describe('Main page', () => {
  test('loads', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveScreenshot();
  });

  test('redirects after uploading files', async ({ pageWithData }) => {
    await waitForChartsToSettle(pageWithData, [
      'running-processes-chart',
      'memory-usage-chart',
      'swap-usage-chart',
      'load-averages-chart',
    ]);

    await expect(pageWithData).toHaveScreenshot();
  });
});
