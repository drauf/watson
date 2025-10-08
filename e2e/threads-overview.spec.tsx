import { expect } from '@playwright/test';
import { test } from './e2e-common';

test.describe('Threads overview', () => {
    const NAME_REGEXP = 'Thread name RegExp';
    const STACK_REGEXP = 'Stack trace RegExp';

    test.beforeEach(async ({ pageWithData }) => {
        await pageWithData.getByText('Threads overview').click();
    });

    test('loads', async ({ pageWithData }) => {
        expect(await pageWithData.getByText('Active').isChecked()).toBeTruthy();
        expect(await pageWithData.getByText('Non-JVM').isChecked()).toBeTruthy();
        expect(await pageWithData.getByText('Tomcat', { exact: true }).isChecked()).toBeFalsy();
        expect(await pageWithData.getByText('Non-Tomcat').isChecked()).toBeFalsy();
        expect(await pageWithData.getByText('Database').isChecked()).toBeFalsy();
        expect(await pageWithData.getByText('Lucene', { exact: true }).isChecked()).toBeFalsy();
        expect(await pageWithData.getByText('Using >10% CPU').isChecked()).toBeFalsy();
        expect(await pageWithData.getByRole('textbox', { name: NAME_REGEXP }).inputValue()).toBe('');
        expect(await pageWithData.getByRole('textbox', { name: STACK_REGEXP }).inputValue()).toBe('');

        await expect(pageWithData).toHaveScreenshot();
    });

    test('has working pre-configured filters', async ({ pageWithData }) => {
        await pageWithData.getByText('Active').uncheck();
        await pageWithData.getByText('Tomcat', { exact: true }).check();
        await expect(pageWithData).toHaveScreenshot();

        await pageWithData.getByText('Active').check();
        await pageWithData.getByText('Tomcat', { exact: true }).uncheck();
        await pageWithData.getByText('Lucene', { exact: true }).check();
        await expect(pageWithData).toHaveScreenshot();

        await pageWithData.getByText('Lucene', { exact: true }).uncheck();
        await pageWithData.getByText('Using >10% CPU').check();
        await expect(pageWithData).toHaveScreenshot();

        await pageWithData.getByText('Using >10% CPU').uncheck();
        await pageWithData.getByText('Non-Tomcat').check();
        await pageWithData.getByText('Database').check();
        await expect(pageWithData).toHaveScreenshot();
    });

    test('has working RegExp thread name filter', async ({ pageWithData }) => {
        await pageWithData.getByRole('textbox', { name: NAME_REGEXP }).fill('^http');
        await expect(pageWithData).toHaveScreenshot();
    });

    test('has working RegExp stack trace filter', async ({ pageWithData }) => {
        await pageWithData.getByRole('textbox', { name: STACK_REGEXP }).fill('(jdk)|(sun)');
        await expect(pageWithData).toHaveScreenshot();
    });

    test('opens thread details', async ({ context, pageWithData }) => {
        const [details] = await Promise.all([
            context.waitForEvent('page'),
            pageWithData.getByRole('button', { name: 'java.lang.reflect' }).click()
        ]);

        await expect(details).toHaveScreenshot();
    });

    test('shows thread name on hover', async ({ pageWithData }) => {
        await pageWithData.getByText('http-nio-').first().hover();
        await expect(pageWithData).toHaveScreenshot();
    });

    test('shows first stack trace line on hover', async ({ pageWithData }) => {
        await pageWithData.getByRole('button', { name: 'java.lang.reflect' }).first().hover();
        await expect(pageWithData).toHaveScreenshot();
    });

    test('does not show popup when hovering over legend', async ({ pageWithData }) => {
        await pageWithData.getByText('Timed waiting').hover();
        await expect(pageWithData).toHaveScreenshot();
    });
});
