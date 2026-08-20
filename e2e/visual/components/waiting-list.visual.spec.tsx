import { expect, test } from '@playwright/test';

test('renders and expands a waiting list beyond its collapsed limit', async ({ mount }) => {
  const component = await mount('components/Monitors/WaitingList/Expandable');
  const waitingList = component.locator('.waiting-list');

  await expect(waitingList.getByText('http-nio-8080-exec-20')).toBeVisible();
  await expect(waitingList.getByText('http-nio-8080-exec-21')).toBeHidden();
  await expect(waitingList).toHaveScreenshot('waiting-list-collapsed.png');

  await waitingList.getByRole('button', { name: 'Expand thread list (1 more thread to show)' }).click();
  await expect(waitingList.getByText('http-nio-8080-exec-21')).toBeVisible();
  await expect(waitingList).toHaveScreenshot('waiting-list-expanded.png');
});
