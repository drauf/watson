import { test, expect } from '@playwright/test';

test('renders something', async ({page}) => {
  await page.goto('/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Watson/);
});
