import { expect } from '@playwright/test';
import { test } from './e2e-common';

test.describe('Monitors', () => {
  test.beforeEach(async ({ pageWithData }) => {
    await pageWithData.getByText('Monitors').click();
  });

  test('loads', async ({ pageWithData }) => {
    await expect(pageWithData.getByRole('button', { name: 'Active', exact: true })).toHaveAttribute('aria-pressed', 'true');

    await expect(pageWithData).toHaveScreenshot();
  });

  test('has working filters', async ({ pageWithData }) => {
    const active = pageWithData.getByRole('button', { name: 'Active', exact: true });
    const unownedLocks = pageWithData.getByRole('button', { name: 'Unowned locks', exact: true });
    await active.click();
    await unownedLocks.click();
    await expect(active).toHaveAttribute('aria-pressed', 'false');
    await expect(unownedLocks).toHaveAttribute('aria-pressed', 'true');

    await expect(pageWithData).toHaveScreenshot();
  });

  test('shows empty state', async ({ pageWithData }) => {
    await pageWithData.getByRole('button', { name: 'Owned locks', exact: true }).click();
    await pageWithData.getByRole('button', { name: 'Unowned locks', exact: true }).click();

    await expect(pageWithData).toHaveScreenshot();
  });
});
