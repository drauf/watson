import { expect } from '@playwright/test';
import { test } from './e2e-common';

test.describe('Threads overview', () => {
  test('loads', async ({ pageWithData }) => {
    await pageWithData.getByText('Threads overview').click();

    await expect(pageWithData).toHaveScreenshot('Threads-overview-loads-1.png');
  });

  test('opens a styled thread details window', async ({ context, pageWithData }) => {
    await pageWithData.getByText('Threads overview').click();

    const [details] = await Promise.all([
      context.waitForEvent('page'),
      pageWithData.getByText('org.bouncycastle').click({ force: true }),
    ]);

    await expect(details.locator('.thread-details')).toBeVisible();
    await expect(details.getByRole('heading', { level: 3 })).toBeVisible();
    await expect(details.locator('.stacktrace-container code').first())
      .toHaveCSS('font-family', /Atlassian Mono/);

    // ThreadDetailsPopup mirrors late-injected styles into the secondary document.
    await pageWithData.evaluate(() => {
      const style = document.createElement('style');
      style.id = 'thread-details-popup-style-sync-test';
      style.textContent = '.thread-details { outline: 1px solid rgb(255, 0, 0); }';
      document.head.append(style);
    });
    await expect(details.locator('.thread-details')).toHaveCSS('outline-width', '1px');
    await pageWithData.evaluate(() => document.getElementById('thread-details-popup-style-sync-test')?.remove());
  });
});
