import { expect } from '@playwright/test';
import { test } from './e2e-common';

test.describe('Similar stacks', () => {
    test.beforeEach(async ({ pageWithData }) => {
        await pageWithData.getByText('Similar stacks').click();
    });

    test('loads', async ({ pageWithData }) => {
        expect(await pageWithData.getByText('Active').isChecked()).toBeTruthy();
        expect(await pageWithData.getByRole('spinbutton', { name: 'Comparison depth' }).inputValue()).toBe('40');
        expect(await pageWithData.getByRole('spinbutton', { name: 'Minimum group size' }).inputValue()).toBe('2');

        await expect(pageWithData).toHaveScreenshot();
    });

    test('has working filters', async ({ pageWithData }) => {
        await pageWithData.getByText('Active').uncheck();
        await pageWithData.getByRole('spinbutton', { name: 'Comparison depth' }).fill('5');
        await pageWithData.getByRole('spinbutton', { name: 'Minimum group size' }).fill('600');

        await expect(pageWithData).toHaveScreenshot();
    });    
    
    test('shows empty state', async ({ pageWithData }) => {
        await pageWithData.getByRole('spinbutton', { name: 'Minimum group size' }).fill('2137');

        await expect(pageWithData).toHaveScreenshot();
    });

    test('can fold sections', async ({ pageWithData }) => {
        const buttons = (await pageWithData.locator('main').getByRole('button').all()).slice(0, 6);

        for (const button of buttons) {
            await button.click()
        }

        await expect(pageWithData).toHaveScreenshot();
    });

    test('opens thread details', async ({ context, pageWithData }) => {
        const [details] = await Promise.all([
            context.waitForEvent('page'),
            pageWithData.locator('main ul').first().getByRole('button').first().click()
        ]);

        await expect(details).toHaveScreenshot();
    });
});
