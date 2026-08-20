import { expect, test } from '@playwright/test';

test('renders CPU usage thresholds and a missing dump', async ({ mount }) => {
  const component = await mount('components/CpuConsumers/CpuConsumerItem/MissingDumpAndThresholds');
  const group = component.locator('.collapsable-group');

  await expect(group).toHaveScreenshot('cpu-consumer-item-collapsed.png');

  await group.getByRole('button', { name: /http-nio-8080-exec-42/ }).click();
  await expect(group.getByText('n/a')).toBeVisible();
  await expect(group.getByRole('button', { name: '85.00%', exact: true })).toBeVisible();
  await expect(group).toHaveScreenshot('cpu-consumer-item-expanded.png');
});
