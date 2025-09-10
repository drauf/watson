import { expect } from '@playwright/test';
import { test } from './e2e-common';

test.describe('Main page', () => {
  test('loads', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveScreenshot();
  });

  test('redirects after uploading files', async ({ pageWithData }) => {
    // todo: there is an animation after charts load - ideally we should wait for some event instead of timeout
    await pageWithData.waitForTimeout(1_500);

    await expect(pageWithData).toHaveScreenshot();
  });
});
