import { expect } from '@playwright/test';
import { loadData, test } from './e2e-common';

test.describe('main page', () => {
  test('loads', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveScreenshot();
  });

  test('redirects after uploading files', async ({ page, dataLocation }) => {
    loadData(page, dataLocation);

    await expect(page).toHaveScreenshot();
  });
});
