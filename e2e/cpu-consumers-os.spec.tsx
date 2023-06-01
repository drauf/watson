import { expect } from '@playwright/test';
import { test } from './e2e-common';

test.describe('CPU consumers OS', () => {
    test.beforeEach(async ({ pageWithData }) => {
        await pageWithData.getByText('CPU consumers (OS)').click();
    });

    test('loads', async ({ pageWithData }) => {
        expect(await pageWithData.getByText('Mean').isChecked()).toBeTruthy();
        expect(await pageWithData.getByRole('spinbutton', { name: 'Threads to show' }).inputValue()).toBe('40');

        await expect(pageWithData).toHaveScreenshot();
    });

    test('has working filters', async ({ pageWithData }) => {
        await pageWithData.getByText('Median').check();
        await pageWithData.getByRole('spinbutton', { name: 'Threads to show' }).fill('10');

        await expect(pageWithData).toHaveScreenshot();
    });

    test('opens thread details', async ({ context, pageWithData }) => {
        const [details] = await Promise.all([
            context.waitForEvent('page'),
            pageWithData.locator('#consumers-list').getByRole('button').first().click()
        ]);

        await expect(details).toHaveScreenshot();
    });
});
