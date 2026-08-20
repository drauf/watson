import { expect, test } from '@playwright/test';

test('renders a real threads overview stack preview on hover', async ({ mount, page }) => {
  const component = await mount('components/ThreadsOverview/ThreadStackPopupContent/TruncatedStackPreview');

  await component.getByRole('button', { name: 'Show stack preview' }).hover();

  const popup = page.locator('.popup-content');
  await expect(popup).toBeVisible();
  await expect(popup.getByText('+1 more stack line')).toBeVisible();
  await expect(popup).toHaveScreenshot('thread-stack-popup-content-open.png');
});
