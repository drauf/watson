import { expect, test } from '@playwright/test';

test.describe('Time window visual states', () => {
  test.describe.configure({ mode: 'serial' });
  test('renders a collapsed same-day control', async ({ mount }) => {
    const component = await mount('components/TimeWindow/TimeWindowFilter/Normal');

    const timeWindow = component.locator('.collapsable-group');
    await expect(timeWindow.getByRole('button', { name: /time window/i })).toHaveAttribute('aria-expanded', 'false');
    await expect(timeWindow).toHaveScreenshot('time-window-collapsed.png');
  });

  test('renders a cross-midnight timeline range', async ({ mount }) => {
    const component = await mount('components/TimeWindow/TimeWindowFilter/CrossMidnight');

    await component.getByRole('button', { name: /time window/i }).click();

    const timeWindow = component.locator('.collapsable-group');
    await expect(timeWindow.getByText(/^Selected: 2026-07-23 23:59:00 - 2026-07-24 00:01:00 · 2 of 2 thread dumps$/)).toBeVisible();
    await expect(timeWindow).toHaveScreenshot('time-window-cross-midnight.png');
  });
});
