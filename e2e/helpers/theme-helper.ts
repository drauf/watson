import { Page } from '@playwright/test';

export type Theme = 'light' | 'dark' | 'auto';

/**
 * Get the current effective theme
 * @param page Playwright page
 * @returns The effective theme ('light' or 'dark')
 */
export async function getEffectiveTheme(page: Page): Promise<'light' | 'dark'> {
  return page.evaluate(() => {
    return document.documentElement.getAttribute('data-color-mode') as 'light' | 'dark';
  });
}

/**
 * Set the theme via UI
 * @param page Playwright page
 * @param theme Theme to set
 */
export async function setThemeViaUI(page: Page, theme: Theme): Promise<void> {
  await page.selectOption('[data-testid="theme-select"]', theme);
}

/**
 * Emulate system dark mode preference
 * @param page Playwright page
 */
export async function emulateSystemDarkMode(page: Page): Promise<void> {
  await page.emulateMedia({ colorScheme: 'dark' });
}

/**
 * Emulate system light mode preference
 * @param page Playwright page
 */
export async function emulateSystemLightMode(page: Page): Promise<void> {
  await page.emulateMedia({ colorScheme: 'light' });
}
