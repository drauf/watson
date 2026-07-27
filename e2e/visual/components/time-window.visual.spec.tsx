import { expect, test } from '@playwright/test';

test.describe('Time window visual states', () => {
  test.describe.configure({ mode: 'serial' });
  test('renders a collapsed same-day control', async ({ mount }) => {
    const component = await mount('components/TimeWindow/TimeWindowFilter/Normal');

    const timeWindow = component.locator('.expandable-surface');
    await expect(timeWindow.getByRole('button', { name: /time window/i })).toHaveAttribute('aria-expanded', 'false');
    await expect(timeWindow).toHaveScreenshot('time-window-collapsed.png');
  });

  test('renders cross-midnight date and time controls', async ({ mount }) => {
    const component = await mount('components/TimeWindow/TimeWindowFilter/CrossMidnight');

    await component.getByRole('button', { name: /time window/i }).click();

    const timeWindow = component.locator('.expandable-surface');
    await expect(timeWindow.getByLabel('From date')).toHaveValue('2026-07-23');
    await expect(timeWindow.getByLabel('To date')).toHaveValue('2026-07-24');
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
    const component = await mount('components/TimeWindow/TimeWindowFilter/PendingLargeRangeWarning');

    await component.getByRole('button', { name: /time window/i }).click();
    await component.getByRole('button', { name: 'Apply' }).click();

    const dialog = component.getByRole('alertdialog', { name: 'Large time window selected' });
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveScreenshot('time-window-large-range-dialog.png');
  });
});
