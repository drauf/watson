import { expect, test } from '@playwright/test';

test('renders expanded similar stack details', async ({ mount }) => {
  const component = await mount('components/SimilarStacks/SimilarStacksGroup/ExpandedGroup');
  const group = component.locator('.collapsable-group');

  await group.getByRole('button', { name: /IndexSearcher\.search/ }).click();
  await expect(group.getByText('http-nio-8080-exec-18')).toBeVisible();
  await expect(group).toHaveScreenshot('similar-stacks-group-expanded.png');
});
