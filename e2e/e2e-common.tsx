import { test as base, Page } from '@playwright/test';
import fs from 'fs';

const getFilesFromPath = (path: string) => {
    return fs.readdirSync(path, { withFileTypes: true })
        .filter(item => !item.isDirectory())
        .map(item => `${path}${item.name}`)
};

export async function loadData(page: Page, dataLocation: string) {
    await page.goto('/');
    await page.setInputFiles('input[type="file"]', getFilesFromPath(dataLocation));
    await page.getByText('Clear current data').isVisible();
};

export type TestOptions = {
    dataLocation: string;
};

export const test = base.extend<TestOptions>({
    dataLocation: ['e2e/test-data/boring-example/', { option: true }],
});
