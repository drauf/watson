import { expect, test } from '@playwright/test';

const stories = [
  ['reading', 'Reading'],
  ['parsing', 'Parsing'],
  ['grouping', 'Grouping'],
  ['complete', 'Complete'],
] as const;

test.describe('Progress indicator visual states', () => {
  test.describe.configure({ mode: 'serial' });

  for (const [name, story] of stories) {
    test(`renders ${name} progress`, async ({ mount }) => {
      const component = await mount(`components/ProgressIndicator/ProgressIndicator/${story}`);
      const progressIndicator = component.locator('.progress-indicator');

      await expect(progressIndicator).toBeVisible();
      await expect(progressIndicator).toHaveScreenshot(`progress-${name}.png`);
    });
  }
});
