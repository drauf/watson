import { expect, test } from '@playwright/test';

test('renders and expands a similar stack thread list beyond its collapsed limit', async ({ mount }) => {
  const component = await mount('components/SimilarStacks/SimilarStacksGroup/ExpandableThreadList');
  const group = component.locator('.collapsable-group');

  await group.getByRole('button', { name: /IndexSearcher\.search/ }).click();
  await expect(group.getByText('http-nio-8080-exec-20')).toBeVisible();
  await expect(group.getByText('http-nio-8080-exec-21')).toBeHidden();
  await expect(group).toHaveScreenshot('similar-stacks-group-list-collapsed.png');

  await group.getByRole('button', { name: 'Expand thread list (1 more thread to show)' }).click();
  await expect(group.getByText('http-nio-8080-exec-21')).toBeVisible();
  await expect(group).toHaveScreenshot('similar-stacks-group-list-expanded.png');
});
