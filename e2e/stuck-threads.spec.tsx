import { expect } from '@playwright/test';
import { test } from './e2e-common';

test.describe('Stuck threads', () => {
    const MIN_STACKS = 'Detection threshold';
    const MAX_LINES = 'Similarity tolerance';

    test.beforeEach(async ({ pageWithData }) => {
        await pageWithData.getByText('Stuck threads').click();
    });

    test('loads', async ({ pageWithData }) => {
        expect(await pageWithData.getByText('Active').isChecked()).toBeTruthy();
        expect(await pageWithData.getByRole('spinbutton', { name: MIN_STACKS }).inputValue()).toBe('10');
        expect(await pageWithData.getByRole('spinbutton', { name: MAX_LINES }).inputValue()).toBe('5');

        await expect(pageWithData).toHaveScreenshot();
    });

    test('has working filters', async ({ pageWithData }) => {
        await pageWithData.getByRole('spinbutton', { name: MIN_STACKS }).fill('5');
        await pageWithData.getByRole('spinbutton', { name: MAX_LINES }).fill('40');

        await expect(pageWithData).toHaveScreenshot();
    });

    test('shows empty state', async ({ pageWithData }) => {
        await pageWithData.getByRole('spinbutton', { name: MIN_STACKS }).fill('2137');

        await expect(pageWithData).toHaveScreenshot();
    });

    test('can fold sections', async ({ pageWithData }) => {
        await pageWithData.getByText('Active').uncheck();
        const buttons = (await pageWithData.locator('main').getByRole('button').all()).slice(0, 10);

        for (const button of buttons) {
            await button.click()
        }

        await expect(pageWithData).toHaveScreenshot();
    });

    test('opens thread details', async ({ context, pageWithData }) => {
        const [details] = await Promise.all([
            context.waitForEvent('page'),
            pageWithData.locator('.group-details').getByRole('button').first().click()
        ]);

        await expect(details).toHaveScreenshot();
    });
});
