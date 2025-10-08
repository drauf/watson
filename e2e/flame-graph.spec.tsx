import { Page, expect } from '@playwright/test';
import { test } from './e2e-common';

test.describe('Flame graph', () => {
    const waitForAnimationToFinish = async (page: Page) => {
        await page.getByText('root').isVisible();
        // the condition above happens a little too early, so we add a little bit of extra wait time
        // yes, I know this sucks, but I'm too lazy to find a proper way to achieve this
        await page.waitForTimeout(750);
    };

    test.beforeEach(async ({ pageWithData }) => {
        await pageWithData.getByText('Flame graph').click();
        await waitForAnimationToFinish(pageWithData);
    });

    test('loads', async ({ pageWithData }) => {
        expect(await pageWithData.getByText('Active').isChecked()).toBeTruthy();

        await expect(pageWithData).toHaveScreenshot();
    });

    test('has working filters', async ({ pageWithData }) => {
        await pageWithData.getByText('Active').uncheck();
        await waitForAnimationToFinish(pageWithData);

        await expect(pageWithData).toHaveScreenshot();
    });

    test('allows zooming', async ({ pageWithData }) => {
        await pageWithData.getByText('IssueRequiredExecutor').first().click();

        await expect(pageWithData).toHaveScreenshot();
    });
});
