import { expect } from '@playwright/test';
import { setNumberInput, test } from './e2e-common';

test.describe('Stuck threads', () => {
  const MIN_STACKS = 'Detection threshold';
  const MAX_LINES = 'Similarity tolerance';

  test.beforeEach(async ({ pageWithData }) => {
    await pageWithData.getByText('Stuck threads').click();
  });

  test('loads', async ({ pageWithData }) => {
    await expect(pageWithData.getByRole('button', { name: 'Active', exact: true })).toHaveAttribute('aria-pressed', 'true');
    expect(await pageWithData.getByLabel(MIN_STACKS).inputValue()).toBe('10');
    expect(await pageWithData.getByLabel(MAX_LINES).inputValue()).toBe('5');

    await expect(pageWithData).toHaveScreenshot('Stuck-threads-loads-1.png');
  });

  test('has working filters', async ({ pageWithData }) => {
    const detectionThreshold = pageWithData.getByLabel(MIN_STACKS);
    const similarityTolerance = pageWithData.getByLabel(MAX_LINES);
    await setNumberInput(detectionThreshold, '5');
    await setNumberInput(similarityTolerance, '30');
    await expect(detectionThreshold).toHaveValue('5');
    await expect(similarityTolerance).toHaveValue('30');

    await expect(pageWithData).toHaveScreenshot('Stuck-threads-has-working-filters-1.png');
  });

  test('shows empty state', async ({ pageWithData }) => {
    await setNumberInput(pageWithData.getByLabel(MIN_STACKS), '2137');

    await expect(pageWithData).toHaveScreenshot('Stuck-threads-shows-empty-state-1.png');
  });

  test('has working regex filters', async ({ pageWithData }) => {
    await pageWithData.getByPlaceholder('e.g. http.*exec').fill('caesium');
    await pageWithData.getByPlaceholder('e.g. java\\.io').fill('CountDownLatch');

    await expect(pageWithData).toHaveScreenshot('Stuck-threads-has-working-regex-filters-1.png');
  });
});
