import { expect } from '@playwright/test';
import { test } from './e2e-common';

test.describe('CPU consumers', () => {
  test.beforeEach(async ({ pageWithData }) => {
    await pageWithData.getByText('CPU consumers').click();
  });

  test('loads', async ({ pageWithData }) => {
    expect(await pageWithData.locator('#settings label', { hasText: /^Mean$/ }).locator('input').isChecked()).toBeTruthy();
    await expect(pageWithData).toHaveScreenshot();
  });

  test('has working sort controls', async ({ pageWithData }) => {
    const median = pageWithData.locator('#settings label', { hasText: /^Median$/ });
    await median.click();
    expect(await median.locator('input').isChecked()).toBeTruthy();

    await expect(pageWithData).toHaveScreenshot();
  });

  test('has working regex filters', async ({ pageWithData }) => {
    await pageWithData.getByPlaceholder('e.g. http.*exec').fill('exec');
    await pageWithData.getByPlaceholder('e.g. java\\.io').fill('java');

    await expect(pageWithData).toHaveScreenshot();
  });
});
