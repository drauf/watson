import { expect, test } from '@playwright/test';

test('renders monitor snapshots with and without an owner', async ({ mount }) => {
  const component = await mount('components/Monitors/MonitorOverTimeItem/OwnerAndWaiters');
  const group = component.locator('.collapsable-group');

  await expect(group).toHaveScreenshot('monitor-over-time-group-collapsed.png');

  await group.getByRole('button', { name: /ReentrantLock/ }).click();
  await expect(group.getByText('ClusterScheduler-1')).toBeVisible();
  await expect(group.getByText('Held by:')).toHaveCount(1);
  await expect(group.getByText('http-nio-8080-exec-24')).toBeVisible();
  await expect(group).toHaveScreenshot('monitor-over-time-group-expanded.png');
});
