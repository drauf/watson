import { expect } from '@playwright/test';
import { test } from './e2e-common';

test.describe('Help page', () => {
  test('loads', async ({ pageWithData }) => {
    await pageWithData.getByText('Help & feedback').click();

    await expect(pageWithData.getByRole('heading', { name: "Glad you're here" })).toBeVisible();
    await expect(pageWithData.getByRole('link', { name: 'GitHub' })).toBeVisible();

    await expect(pageWithData).toHaveScreenshot('Help-page-loads-1.png');
  });
});
