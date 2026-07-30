import { expect } from '@playwright/test';
import { test } from './e2e-common';

test.describe('CPU consumers', () => {
  test.beforeEach(async ({ pageWithData }) => {
    await pageWithData.getByText('CPU consumers').click();
  });

  test('loads', async ({ pageWithData }) => {
    await expect(pageWithData.getByRole('button', { name: 'Mean', exact: true })).toHaveAttribute('aria-pressed', 'true');
    await expect(pageWithData).toHaveScreenshot();
  });

  test('has working sort controls', async ({ pageWithData }) => {
    const median = pageWithData.getByRole('button', { name: 'Median', exact: true });
    await median.click();
    await expect(median).toHaveAttribute('aria-pressed', 'true');

    await expect(pageWithData).toHaveScreenshot();
  });

  test('has working regex filters', async ({ pageWithData }) => {
    await pageWithData.getByPlaceholder('e.g. http.*exec').fill('exec');
    await pageWithData.getByPlaceholder('e.g. java\\.io').fill('java');

    await expect(pageWithData).toHaveScreenshot();
  });

  test('shows an empty state when no CPU consumers match', async ({ pageWithData }) => {
    await pageWithData.getByLabel('Thread name pattern').fill('^does-not-exist$');

    await expect(pageWithData.getByText('No threads match the selected criteria.')).toBeVisible();
    await expect(pageWithData).toHaveScreenshot();
  });
});
