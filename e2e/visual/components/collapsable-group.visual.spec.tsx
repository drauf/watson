import { expect, test } from '@playwright/test';

test.describe('Collapsable group visual states', () => {
  test('renders a collapsed group', async ({ mount }) => {
    const component = await mount('components/CollapsableGroup/Basic');
    const group = component.locator('.collapsable-group');

    await expect(group.getByRole('button', { name: 'Thread pool worker group' })).toHaveAttribute('aria-expanded', 'false');
    await expect(group).toHaveScreenshot('collapsable-group-collapsed.png');
  });

  test('renders an expanded group', async ({ mount }) => {
    const component = await mount('components/CollapsableGroup/Basic');
    const group = component.locator('.collapsable-group');

    await group.getByRole('button', { name: 'Thread pool worker group' }).click();
    await expect(group.getByText('The group body contains representative analysis details. It is hidden until the group is expanded.')).toBeVisible();
    await expect(group).toHaveScreenshot('collapsable-group-expanded.png');
  });

  test('renders rich header metadata without truncating it', async ({ mount }) => {
    const component = await mount('components/CollapsableGroup/RichHeader');
    const group = component.locator('.collapsable-group');

    await expect(group.getByText('Database')).toBeVisible();
    await expect(group.getByText('Lucene', { exact: true })).toBeVisible();
    await expect(group).toHaveScreenshot('collapsable-group-rich-header.png');
  });
});
