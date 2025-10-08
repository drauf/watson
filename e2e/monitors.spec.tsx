import {expect} from '@playwright/test';
import {test} from './e2e-common';

test.describe('Monitors', () => {
  test.beforeEach(async ({pageWithData}) => {
    await pageWithData.getByText('Monitors').click();
  });

  test('loads', async ({pageWithData}) => {
    expect(await pageWithData.getByText('Active').isChecked()).toBeTruthy();

    await expect(pageWithData).toHaveScreenshot();
  });

  test('has working filters', async ({pageWithData}) => {
    await pageWithData.getByText('Active').uncheck();
    await pageWithData.getByText('Unowned locks').check();

    await expect(pageWithData).toHaveScreenshot();
  });

  test('shows empty state', async ({pageWithData}) => {
    await pageWithData.getByText('Owned locks', { exact: true }).check();
    await pageWithData.getByText('Unowned locks').check();

    await expect(pageWithData).toHaveScreenshot();
  });

  test('can fold sections', async ({pageWithData}) => {
    const buttons = (await pageWithData.locator('main').getByRole('button').all()).slice(0, 10);

    for (const button of buttons) {
      await button.click()
    }

    await expect(pageWithData).toHaveScreenshot();
  });

  test('opens thread details', async ({context, pageWithData}) => {
    const [details] = await Promise.all([
      context.waitForEvent('page'),
      pageWithData.locator('.monitors-container').getByRole('button').first().click()
    ]);

    await expect(details).toHaveScreenshot();
  });
});
