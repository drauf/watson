import { defineConfig, devices } from '@playwright/test';

const testData = new Map([
  ['boring example', 'e2e/test-data/boring-example/'],
]);

const browsers = new Map([
  ['chrome', devices['Desktop Chrome']],
  ['safari', devices['Desktop Safari']],
  ['edge', devices['Desktop Edge']],
  ['firefox', devices['Desktop Firefox']],
]);

const viewports = [
  { width: 1680, height: 1050 }
];

const getProjects = () => {
  const projects = new Array();

  for (const [dataName, dataLocation] of testData) {
    for (const [browserName, browser] of browsers) {
      for (const viewport of viewports) {
        const project = {
          name: `${dataName} - ${browserName} - ${viewport.width}x${viewport.height}`,
          use: {
            ...browser,
            viewport: viewport,
            dataLocation: dataLocation,
          },
        };

        projects.push(project)
      }
    }
  }

  return projects;
}

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// require('dotenv').config();

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
  workers: process.env.CI ? 4 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Extend timeout for each assertion as screenshots take forever to take */
  expect: { timeout: 10000 },
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
