import {
  expect, Locator, Page, test as base,
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

const expandGroup = async (group: Locator) => {
  const toggle = group.locator('.collapsable-group-toggle');
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(group.locator('.collapsable-group-content')).toBeVisible();
};

export const expandRepresentativeGroup = async (page: Page) => {
  await expect(page.locator('.paginated-collection-actions')).toBeVisible();
  const groups = page.locator('.paginated-collection-actions ~ section.collapsable-group');
  const count = await groups.count();
  if (count === 0) {
    throw new Error('No result groups were found');
  }

  await expandGroup(groups.nth(Math.min(2, count - 1)));
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
