import { expect, test } from '@playwright/test';

test.describe('Thread Details visual states', () => {
  test.describe.configure({ mode: 'serial' });
  test('renders a waiting thread with lock details', async ({ mount }) => {
    const component = await mount('components/ThreadDetails/ThreadDetailsWindow/WaitingThreadWithLocks');

    await expect(component.getByText('WAITING', { exact: true })).toBeVisible();
    await expect(component.getByRole('heading', { name: 'Waiting for' })).toBeVisible();
    await expect(component.getByTestId('thread-details-popup'))
      .toHaveScreenshot('thread-details-waiting-with-locks.png');
  });

  test('renders a runnable thread without locks', async ({ mount }) => {
    const component = await mount('components/ThreadDetails/ThreadDetailsWindow/RunnableThreadWithoutLocks');

    await expect(component.getByText('RUNNABLE', { exact: true })).toBeVisible();
    await expect(component.getByText('This thread does not hold any locks')).toBeVisible();
    await expect(component.getByTestId('thread-details-popup'))
      .toHaveScreenshot('thread-details-runnable-without-locks.png');
  });
});
