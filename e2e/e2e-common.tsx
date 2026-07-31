import {
  expect, Page, test as base,
} from '@playwright/test';
import fs from 'fs';

const getFilesFromPath = (path: string) => fs.readdirSync(path, { withFileTypes: true })
  .filter((item) => !item.isDirectory())
  .map((item) => `${path}${item.name}`);

const loadData = async (page: Page, dataLocation: string) => {
  await page.goto('/');
  await page.setInputFiles('input[type="file"]', getFilesFromPath(dataLocation));
  await expect(page.getByText('Clear data')).toBeVisible();
};

export const expandRepresentativeGroup = async (page: Page): Promise<void> => {
  const toggles = page.locator('.collapsable-group-toggle');
  const count = await toggles.count();

  if (count > 1) {
    await toggles.nth(Math.min(2, count - 1)).click();
  }
};

const clearData = async (page: Page) => {
  await page.getByText('Clear data').click();
};

interface TestOptions {
  dataLocation: string;
  pageWithData: Page;
}

export const test = base.extend<TestOptions>({
  dataLocation: ['test-data/boring-example/', { option: true }],

  pageWithData: async ({ page, dataLocation }, use) => {
    await loadData(page, dataLocation);
    await use(page);
    await clearData(page);
  },
});
