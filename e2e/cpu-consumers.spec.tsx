import {expect} from '@playwright/test';
import {test} from './e2e-common';

test.describe('CPU consumers', () => {
  test.beforeEach(async ({pageWithData}) => {
    await pageWithData.getByText('CPU consumers').click();
  });

  test('loads', async ({pageWithData}) => {
    expect(await pageWithData.getByText('Mean').isChecked()).toBeTruthy();
    expect(await pageWithData.getByLabel('Threads to show').inputValue()).toBe('40');

    await expect(pageWithData).toHaveScreenshot();
  });

  test('has working filters', async ({pageWithData}) => {
    await pageWithData.getByText('Median').check();
    await pageWithData.getByLabel('Threads to show').fill('10');

    await expect(pageWithData).toHaveScreenshot();
  });

  test('has working regex filters', async ({pageWithData}) => {
    await pageWithData.getByPlaceholder('e.g. http.*exec').fill('exec');
    await pageWithData.getByPlaceholder('e.g. java\\.io').fill('java');

    await expect(pageWithData).toHaveScreenshot();
  });

  test('opens thread details', async ({context, pageWithData}) => {
    const [details] = await Promise.all([
      context.waitForEvent('page'),
      pageWithData.locator('#consumers-list').getByRole('button').first().click()
    ]);

    await expect(details).toHaveScreenshot();
  });
});
