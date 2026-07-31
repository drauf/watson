import { expect, test } from '@playwright/test';

test.describe('Hover popup visual states', () => {
  test('renders shared rich content on hover', async ({ mount, page }) => {
    const component = await mount('components/common/HoverPopup/Basic');
    const trigger = component.getByRole('button', { name: 'Show thread details' });

    await trigger.hover();

    const popup = page.locator('.popup-content');
    await expect(popup).toBeVisible();
    await expect(popup).toHaveScreenshot('hover-popup-open.png');
  });

  test('does not intercept clicks on adjacent content', async ({ mount, page }) => {
    const component = await mount('components/common/HoverPopup/Basic');
    const trigger = component.getByRole('button', { name: 'Show thread details' });

    await trigger.hover();
    await expect(page.locator('.popup-content')).toBeVisible();
    await component.getByRole('button', { name: 'Toggle details' }).click();

    await expect(component.getByText('Details toggled')).toBeVisible();
  });

  test('closes after the pointer leaves', async ({ mount, page }) => {
    const component = await mount('components/common/HoverPopup/Basic');
    const trigger = component.getByRole('button', { name: 'Show thread details' });

    await trigger.hover();
    await page.mouse.move(1200, 800);

    await expect(page.locator('.popup-content')).toBeHidden();
  });
});
