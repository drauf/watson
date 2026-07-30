import { expect, test } from '@playwright/test';

test.describe('Time window visual states', () => {
  test.describe.configure({ mode: 'serial' });
  test('renders a collapsed same-day control', async ({ mount }) => {
    const component = await mount('components/TimeWindow/TimeWindowFilter/Normal');

    const timeWindow = component.locator('.expandable-surface');
    await expect(timeWindow.getByRole('button', { name: /time window/i })).toHaveAttribute('aria-expanded', 'false');
    await expect(timeWindow).toHaveScreenshot('time-window-collapsed.png');
  });

  test('renders a cross-midnight timeline range', async ({ mount }) => {
    const component = await mount('components/TimeWindow/TimeWindowFilter/CrossMidnight');

    await component.getByRole('button', { name: /time window/i }).click();

    const timeWindow = component.locator('.expandable-surface');
    await expect(timeWindow.getByText(/^Selected range: 2026-07-23 23:59:00 - 2026-07-24 00:01:00\./)).toBeVisible();
    await expect(timeWindow).toHaveScreenshot('time-window-cross-midnight.png');
  });

  test('renders a pending large-range warning', async ({ mount }) => {
    const component = await mount('components/TimeWindow/TimeWindowFilter/PendingLargeRangeWarning');

    await component.getByRole('button', { name: /time window/i }).click();

    const timeWindow = component.locator('.expandable-surface');
    await expect(timeWindow.getByText(/large ranges can slow analysis pages/i)).toBeVisible();
    await expect(timeWindow).toHaveScreenshot('time-window-large-range-warning.png');
  });

  test('renders the large-range confirmation dialog', async ({ mount }) => {
    const component = await mount('components/TimeWindow/TimeWindowFilter/LargeRangeDialog');
    const dialog = component.locator('xpath=..').getByRole('dialog', { name: 'Large time window selected' });

    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveScreenshot('time-window-large-range-dialog.png');
  });
});
