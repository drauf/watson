import { Page, expect } from '@playwright/test';
import { test } from './e2e-common';

test.describe('Flame graph', () => {
  const waitForAnimationToFinish = async (page: Page) => {
    await page.getByText('root').first().isVisible();
  };

  test.beforeEach(async ({ pageWithData }) => {
    await pageWithData.getByText('Flame graph').click();
    await waitForAnimationToFinish(pageWithData);
  });

  test('loads', async ({ pageWithData }) => {
    await expect(pageWithData.getByRole('button', { name: 'Active', exact: true })).toHaveAttribute('aria-pressed', 'true');

    await expect(pageWithData).toHaveScreenshot('Flame-graph-loads-1.png');
  });

  test('has working filters', async ({ pageWithData }) => {
    const active = pageWithData.getByRole('button', { name: 'Active', exact: true });
    await active.click();
    await expect(active).toHaveAttribute('aria-pressed', 'false');
    await waitForAnimationToFinish(pageWithData);

    await expect(pageWithData).toHaveScreenshot('Flame-graph-has-working-filters-1.png');
  });

  test('allows zooming', async ({ pageWithData }) => {
    await pageWithData.getByText('IssueRequiredExecutor').first().click({ force: true });

    await expect(pageWithData).toHaveScreenshot('Flame-graph-allows-zooming-1.png');
  });

  test('has working thread name regex filter', async ({ pageWithData }) => {
    await pageWithData.getByPlaceholder('e.g. http.*exec').fill('http.*exec');
    await waitForAnimationToFinish(pageWithData);

    await expect(pageWithData).toHaveScreenshot('Flame-graph-has-working-thread-name-regex-filter-1.png');
  });

  test('has working stack trace regex filter', async ({ pageWithData }) => {
    await pageWithData.getByPlaceholder('e.g. java\\.io').fill('^com\\.codebarrel');
    await waitForAnimationToFinish(pageWithData);

    await expect(pageWithData).toHaveScreenshot('Flame-graph-has-working-stack-trace-regex-filter-1.png');
  });

  test('shows an empty state when no threads match', async ({ pageWithData }) => {
    await pageWithData.getByLabel('Thread name pattern').fill('^does-not-exist$');

    await expect(pageWithData.getByText('No threads match the selected criteria.')).toBeVisible();
    await expect(pageWithData).toHaveScreenshot('Flame-graph-shows-an-empty-state-when-no-threads-match-1.png');
  });
});
