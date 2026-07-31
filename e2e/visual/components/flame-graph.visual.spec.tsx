import { expect, test } from '@playwright/test';

test.describe('Flame graph tooltip visual states', () => {
  test('renders detailed CursorPopup content for a frame', async ({ mount, page }) => {
    const component = await mount('components/FlameGraph/FlameGraph/Basic');
    const frame = component.getByText('IndexSearcher.search @ line 42');

    await expect(frame).toBeVisible();
    await frame.hover({ force: true });

    const popup = page.locator('.cursor-popup .popup-content');
    await expect(popup).toBeVisible();
    await expect(popup).toHaveScreenshot('flame-graph-cursor-popup.png');
  });

  test('closes CursorPopup after leaving the frame', async ({ mount, page }) => {
    const component = await mount('components/FlameGraph/FlameGraph/Basic');
    const frame = component.getByText('IndexSearcher.search @ line 42');

    await frame.hover({ force: true });
    await page.mouse.move(1200, 800);

    await expect(page.locator('.cursor-popup .popup-content')).toBeHidden();
  });
});
