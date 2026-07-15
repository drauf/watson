import {Page, expect} from '@playwright/test';
import {test} from './e2e-common';

test.describe('Flame graph', () => {
  const waitForAnimationToFinish = async (page: Page) => {
    await page.getByText('root').first().isVisible();
  };

  test.beforeEach(async ({pageWithData}) => {
    await pageWithData.getByText('Flame graph').click();
    await waitForAnimationToFinish(pageWithData);
  });

  test('loads', async ({pageWithData}) => {
    expect(await pageWithData.getByText('Active').isChecked()).toBeTruthy();

    await expect(pageWithData).toHaveScreenshot();
  });

  test('has working filters', async ({pageWithData}) => {
    await pageWithData.getByText('Active').uncheck();
    await waitForAnimationToFinish(pageWithData);

    await expect(pageWithData).toHaveScreenshot();
  });

  test('allows zooming', async ({pageWithData}) => {
    await pageWithData.getByText('IssueRequiredExecutor').first().click({ force: true });

    await expect(pageWithData).toHaveScreenshot();
  });

  test('has working thread name regex filter', async ({pageWithData}) => {
    await pageWithData.getByPlaceholder('e.g. http.*exec').fill('http.*exec');
    await waitForAnimationToFinish(pageWithData);

    await expect(pageWithData).toHaveScreenshot();
  });

  test('has working stack trace regex filter', async ({pageWithData}) => {
    await pageWithData.getByPlaceholder('e.g. java\\.io').fill('^com\\.codebarrel');
    await waitForAnimationToFinish(pageWithData);

    await expect(pageWithData).toHaveScreenshot();
  });
});
