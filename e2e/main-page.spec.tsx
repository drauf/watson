import { expect } from '@playwright/test';
import { test } from './e2e-common';

test.describe('Main page', () => {
  test('loads', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveScreenshot();
  });

  test('redirects after uploading files', async ({ pageWithData }) => {
    await expect(pageWithData).toHaveScreenshot();
  });
});
