import { expect, test } from '@playwright/test';

test('renders expanded stuck thread details', async ({ mount }) => {
  const component = await mount('components/StuckThreads/StuckThreadsGroup/ExpandedGroup');
  const group = component.locator('.collapsable-group');

  await group.getByRole('button', { name: /SearchService/ }).click();
  await expect(group.getByText('10:00:05')).toBeVisible();
  await expect(group).toHaveScreenshot('stuck-threads-group-expanded.png');
});
