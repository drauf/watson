import { expect } from '@playwright/test';
import { setNumberInput, test } from './e2e-common';

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

    await expect(pageWithData).toHaveScreenshot('Similar-stacks-loads-1.png');
  });

  test('has working filters', async ({ pageWithData }) => {
    const active = pageWithData.getByRole('button', { name: 'Active', exact: true });
    await active.click();
    await expect(active).toHaveAttribute('aria-pressed', 'false');
    const comparisonDepth = pageWithData.getByLabel(COMPARISON_DEPTH);
    const minimumGroupSize = pageWithData.getByLabel(MINIMUM_GROUP_SIZE);
    await setNumberInput(comparisonDepth, '4');
    await setNumberInput(minimumGroupSize, '600');
    await expect(comparisonDepth).toHaveValue('4');
    await expect(minimumGroupSize).toHaveValue('600');

    await expect(pageWithData).toHaveScreenshot('Similar-stacks-has-working-filters-1.png');
  });

  test('shows empty state', async ({ pageWithData }) => {
    await setNumberInput(pageWithData.getByLabel(MINIMUM_GROUP_SIZE), '2137');

    await expect(pageWithData).toHaveScreenshot('Similar-stacks-shows-empty-state-1.png');
  });

  test('has working regex filters', async ({ pageWithData }) => {
    await pageWithData.getByPlaceholder('e.g. http.*exec').fill('caesium');
    await pageWithData.getByPlaceholder('e.g. java\\.io').fill('reIndex');

    await expect(pageWithData).toHaveScreenshot('Similar-stacks-has-working-regex-filters-1.png');
  });
});
