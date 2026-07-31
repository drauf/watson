import { expect } from '@playwright/test';
import { test } from './e2e-common';

test.describe('Main page', () => {
  test('loads', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveScreenshot('Main-page-loads-1.png');
  });

  test('redirects after uploading files', async ({ pageWithData }) => {
    await expect(pageWithData).toHaveScreenshot('Main-page-redirects-after-uploading-files-1.png');
  });

  test('opens the theme picker beside its trigger', async ({ pageWithData }) => {
    const trigger = pageWithData.getByTestId('theme-picker--trigger');
    await trigger.click();

    const menuItem = pageWithData.getByTestId('theme-picker--content').getByText('Light', { exact: true });
    await expect(menuItem).toBeVisible();

    const [triggerBounds, menuBounds] = await Promise.all([trigger.boundingBox(), menuItem.boundingBox()]);
    expect(triggerBounds).not.toBeNull();
    expect(menuBounds).not.toBeNull();
    expect(menuBounds!.y).toBeGreaterThanOrEqual(triggerBounds!.y + triggerBounds!.height);
    expect(Math.abs(menuBounds!.x - triggerBounds!.x)).toBeLessThan(300);
    await pageWithData.keyboard.press('Escape');
  });
});
