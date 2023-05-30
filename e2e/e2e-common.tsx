import { test as base, Page, TestFixture } from '@playwright/test';
import fs from 'fs';

const getFilesFromPath = (path: string) => {
    return fs.readdirSync(path, { withFileTypes: true })
        .filter(item => !item.isDirectory())
        .map(item => `${path}${item.name}`)
};

const loadData = async (page: Page, dataLocation: string) => {
    await page.goto('/');
    await page.setInputFiles('input[type="file"]', getFilesFromPath(dataLocation));
    await page.getByText('Clear current data').isVisible();
};

const clearData = async (page: Page) => {
    await page.getByText('Clear current data').click();
};

type TestOptions = {
    dataLocation: string;
    pageWithData: Page;
};

export const test = base.extend<TestOptions>({
    dataLocation: ['e2e/test-data/boring-example/', { option: true }],

    pageWithData: async ({ page, dataLocation }, use) => {
        await loadData(page, dataLocation);
        await use(page);
        await clearData(page);
    }
});
