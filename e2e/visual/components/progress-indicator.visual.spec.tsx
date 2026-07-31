import { expect, test } from '@playwright/test';

test.describe('Progress indicator visual states', () => {
  test.describe.configure({ mode: 'serial' });

  test('renders reading progress', async ({ mount }) => {
    const component = await mount('components/ProgressIndicator/ProgressIndicator/Reading');
    const progressIndicator = component.locator('.progress-indicator');

    await expect(progressIndicator).toBeVisible();
    await expect(progressIndicator).toHaveScreenshot('progress-reading.png');
  });

  test('renders parsing progress', async ({ mount }) => {
    const component = await mount('components/ProgressIndicator/ProgressIndicator/Parsing');
    const progressIndicator = component.locator('.progress-indicator');

    await expect(progressIndicator).toBeVisible();
    await expect(progressIndicator).toHaveScreenshot('progress-parsing.png');
  });

  test('renders grouping progress', async ({ mount }) => {
    const component = await mount('components/ProgressIndicator/ProgressIndicator/Grouping');
    const progressIndicator = component.locator('.progress-indicator');

    await expect(progressIndicator).toBeVisible();
    await expect(progressIndicator).toHaveScreenshot('progress-grouping.png');
  });

  test('renders complete progress', async ({ mount }) => {
    const component = await mount('components/ProgressIndicator/ProgressIndicator/Complete');
    const progressIndicator = component.locator('.progress-indicator');

    await expect(progressIndicator).toBeVisible();
    await expect(progressIndicator).toHaveScreenshot('progress-complete.png');
  });
});
