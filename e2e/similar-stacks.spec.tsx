import { expect } from '@playwright/test';
import { test } from './e2e-common';

test.describe('Similar stacks', () => {
  const COMPARISON_DEPTH = 'Comparison depth';
  const MINIMUM_GROUP_SIZE = 'Minimum group size';

  test.beforeEach(async ({ pageWithData }) => {
    await pageWithData.getByText('Similar stacks').click();
  });

  test('loads', async ({ pageWithData }) => {
    await expect(pageWithData.getByRole('button', { name: 'Active', exact: true })).toHaveAttribute('aria-pressed', 'true');

    expect(await pageWithData.getByLabel(COMPARISON_DEPTH).inputValue()).toBe('30');
    expect(await pageWithData.getByLabel(MINIMUM_GROUP_SIZE).inputValue()).toBe('5');

    await expect(pageWithData).toHaveScreenshot();
  });

  test('has working filters', async ({ pageWithData }) => {
    const active = pageWithData.getByRole('button', { name: 'Active', exact: true });
    await active.click();
    await expect(active).toHaveAttribute('aria-pressed', 'false');
    await pageWithData.getByLabel(COMPARISON_DEPTH).fill('4');
    await pageWithData.getByLabel(MINIMUM_GROUP_SIZE).fill('600');

    await expect(pageWithData).toHaveScreenshot();
  });

  test('shows empty state', async ({ pageWithData }) => {
    await pageWithData.getByLabel(MINIMUM_GROUP_SIZE).fill('2137');

    await expect(pageWithData).toHaveScreenshot();
  });

  test('has working regex filters', async ({ pageWithData }) => {
    await pageWithData.getByPlaceholder('e.g. http.*exec').fill('caesium');
    await pageWithData.getByPlaceholder('e.g. java\\.io').fill('reIndex');

    await expect(pageWithData).toHaveScreenshot();
  });
});
