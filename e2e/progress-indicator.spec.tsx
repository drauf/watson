import { test, expect } from '@playwright/test';

test.describe('Progress Indicator Visual Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/#/test/progress');
  });

  test('shows reading phase at 5%', async ({ page }) => {
    await page.getByRole('button', { name: 'Reading Files' }).click();

    await expect(page.locator('.progress-indicator')).toBeVisible();
    await expect(page.locator('.progress-percentage')).toContainText('5%');

    await expect(page.getByTestId("progress-container")).toHaveScreenshot('progress-reading.png');
  });

  test('shows parsing phase at 45%', async ({ page }) => {
    await page.getByRole('button', { name: 'Parsing (45%)' }).click();

    await expect(page.locator('.progress-percentage')).toContainText('45%');
    await expect(page.locator('.progress-lines')).toBeVisible();

    await expect(page.getByTestId("progress-container")).toHaveScreenshot('progress-parsing.png');
  });

  test('shows grouping phase at 95%', async ({ page }) => {
    await page.getByRole('button', { name: 'Grouping (95%)' }).click();

    await expect(page.locator('.progress-percentage')).toContainText('95%');

    await expect(page.getByTestId("progress-container")).toHaveScreenshot('progress-grouping.png');
  });

  test('shows complete phase at 100%', async ({ page }) => {
    await page.getByRole('button', { name: 'Complete' }).click();

    await expect(page.locator('.progress-percentage')).toContainText('100%');

    await expect(page.getByTestId("progress-container")).toHaveScreenshot('progress-complete.png');
  });
});
