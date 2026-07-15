import { defineConfig, devices } from '@playwright/test';

const browsers = new Map([
  ['chrome', devices['Desktop Chrome']],
  ['firefox', devices['Desktop Firefox']],
]);

const viewports = [
  { width: 1680, height: 1050 }
];

const colorSchemes = ['light', 'dark'];

const getProjects = () => {
  const projects = [];

  projects.push({
    name: 'disable animations',
    testMatch: /global\.setup\.tsx/,
  });

  for (const [browserName, browser] of browsers) {
    for (const viewport of viewports) {
      for (const colorScheme of colorSchemes) {
        const project = {
          name: `${browserName}-${colorScheme}`,
          use: {
            ...browser,
            colorScheme: colorScheme,
            viewport: viewport,
            dependencies: ['disable animations'],
          },
        };

        projects.push(project)
      }
    }
  }

  return projects;
}

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './e2e',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  timeout: 30_000,
  expect: {
    /* Limit the maximum pixel ratio for image comparisons to 0.1% */
    toHaveScreenshot: { maxDiffPixelRatio: 0.001 },
  },
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },

  /* Configure projects for major browsers */
  projects: getProjects(),

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'yarn start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
