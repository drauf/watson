import { expect, test } from '@playwright/test';

test.describe('Theme picker visual state', () => {
  test('renders its menu below the trigger', async ({ mount, page }) => {
    const component = await mount('components/ThemeSwitcher/ThemeSwitcher/Basic');
    const trigger = component.getByTestId('theme-picker--trigger');

    await trigger.click();

    const menu = page.getByTestId('theme-picker--content');
    await expect(menu.getByText('Match system', { exact: true })).toBeVisible();

    const [triggerBox, menuBox] = await Promise.all([trigger.boundingBox(), menu.boundingBox()]);
    expect(triggerBox).not.toBeNull();
    expect(menuBox).not.toBeNull();

    const padding = 8;
    const left = Math.min(triggerBox!.x, menuBox!.x) - padding;
    const top = Math.min(triggerBox!.y, menuBox!.y) - padding;
    const right = Math.max(triggerBox!.x + triggerBox!.width, menuBox!.x + menuBox!.width) + padding;
    const bottom = Math.max(triggerBox!.y + triggerBox!.height, menuBox!.y + menuBox!.height) + padding;

    await expect(page).toHaveScreenshot('theme-picker-open.png', {
      clip: {
        x: left, y: top, width: right - left, height: bottom - top,
      },
    });
  });
});
