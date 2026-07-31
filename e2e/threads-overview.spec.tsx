import { expect } from '@playwright/test';
import { setNumberInput, test } from './e2e-common';

test.describe('Threads overview', () => {
  const NAME_REGEXP = 'Thread name pattern';
  const STACK_REGEXP = 'Stack trace pattern';

  test.beforeEach(async ({ pageWithData }) => {
    await pageWithData.getByText('Threads overview').click();
  });

  test('loads', async ({ pageWithData }) => {
    await expect(pageWithData.getByRole('button', { name: 'Active', exact: true })).toHaveAttribute('aria-pressed', 'true');
    await expect(pageWithData.getByRole('button', { name: 'Non-JVM', exact: true })).toHaveAttribute('aria-pressed', 'true');
    await expect(pageWithData.getByRole('button', { name: 'Tomcat', exact: true })).toHaveAttribute('aria-pressed', 'false');
    await expect(pageWithData.getByRole('button', { name: 'Non-Tomcat', exact: true })).toHaveAttribute('aria-pressed', 'false');
    await expect(pageWithData.getByRole('button', { name: 'Database', exact: true })).toHaveAttribute('aria-pressed', 'false');
    await expect(pageWithData.getByRole('button', { name: 'Lucene', exact: true })).toHaveAttribute('aria-pressed', 'false');
    await expect(pageWithData.getByRole('button', { name: 'High CPU usage', exact: true })).toHaveAttribute('aria-pressed', 'false');
    expect(await pageWithData.getByLabel(NAME_REGEXP).inputValue()).toBe('');
    expect(await pageWithData.getByLabel(STACK_REGEXP).inputValue()).toBe('');
    expect(await pageWithData.getByLabel('Table column width').inputValue()).toBe('160');
    expect(await pageWithData.getByLabel('Stack preview lines').inputValue()).toBe('10');

    await expect(pageWithData).toHaveScreenshot('Threads-overview-loads-1.png');
  });

  test('updates dump column width', async ({ pageWithData }) => {
    const tableColumnWidth = pageWithData.getByLabel('Table column width');
    const stackPreviewLines = pageWithData.getByLabel('Stack preview lines');
    await setNumberInput(tableColumnWidth, '240');
    await expect(tableColumnWidth).toHaveValue('240');

    const configuredDumpColumnWidth = await pageWithData.locator('.threads-overview-dump-column').first().evaluate(
      (column) => parseFloat(getComputedStyle(column).width),
    );
    expect(configuredDumpColumnWidth).toBeGreaterThanOrEqual(239);

    await setNumberInput(tableColumnWidth, '0');
    await setNumberInput(stackPreviewLines, '12');
    await expect(stackPreviewLines).toHaveValue('12');

    await expect(pageWithData.locator('.threads-overview-table')).toHaveClass(/threads-overview-table-fit-columns/);
    await expect(pageWithData).toHaveScreenshot('Threads-overview-updates-dump-column-width-1.png');
  });

  test('has working pre-configured filters', async ({ pageWithData }) => {
    const active = pageWithData.getByRole('button', { name: 'Active', exact: true });
    const tomcat = pageWithData.getByRole('button', { name: 'Tomcat', exact: true });
    const lucene = pageWithData.getByRole('button', { name: 'Lucene', exact: true });
    const highCpuUsage = pageWithData.getByRole('button', { name: 'High CPU usage', exact: true });
    const nonTomcat = pageWithData.getByRole('button', { name: 'Non-Tomcat', exact: true });
    const database = pageWithData.getByRole('button', { name: 'Database', exact: true });

    await active.click();
    await tomcat.click();
    await expect(pageWithData).toHaveScreenshot('Threads-overview-has-working-pre-configured-filters-1.png');

    await active.click();
    await tomcat.click();
    await lucene.click();
    await expect(pageWithData).toHaveScreenshot('Threads-overview-has-working-pre-configured-filters-2.png');

    await lucene.click();
    await highCpuUsage.click();
    await expect(pageWithData).toHaveScreenshot('Threads-overview-has-working-pre-configured-filters-3.png');

    await highCpuUsage.click();
    await nonTomcat.click();
    await database.click();
    await expect(pageWithData).toHaveScreenshot('Threads-overview-has-working-pre-configured-filters-4.png');
  });

  test('has working RegExp thread name filter', async ({ pageWithData }) => {
    await pageWithData.getByLabel(NAME_REGEXP).fill('^http');
    await expect(pageWithData).toHaveScreenshot('Threads-overview-has-working-RegExp-thread-name-filter-1.png');
  });

  test('has working RegExp stack trace filter', async ({ pageWithData }) => {
    await pageWithData.getByLabel(STACK_REGEXP).fill('(jdk)|(sun)');
    await expect(pageWithData).toHaveScreenshot('Threads-overview-has-working-RegExp-stack-trace-filter-1.png');
  });

  test('shows an empty state when no threads match', async ({ pageWithData }) => {
    await pageWithData.getByLabel(NAME_REGEXP).fill('^does-not-exist$');

    await expect(pageWithData.getByText('No threads match the selected criteria.')).toBeVisible();
    await expect(pageWithData).toHaveScreenshot('Threads-overview-shows-an-empty-state-when-no-threads-match-1.png');
  });
  test('opens thread details', async ({ context, pageWithData }) => {
    const [details] = await Promise.all([
      context.waitForEvent('page'),
      pageWithData.getByText('org.bouncycastle').click({ force: true }),
    ]);

    await expect(details.locator('.thread-details')).toBeVisible();
    await expect(details.getByRole('heading', { level: 3 })).toBeVisible();
    await expect(details.locator('.stacktrace-container code').first())
      .toHaveCSS('font-family', /Atlassian Mono/);

    // ThreadDetailsPopup mirrors <head> stylesheets into the popup document.
    // This checks that a style added to the opener after the popup opened
    // still reaches the popup, since Emotion/Compiled inject styles lazily.
    await pageWithData.evaluate(() => {
      const style = document.createElement('style');
      style.id = 'thread-details-popup-style-sync-test';
      style.textContent = '.thread-details { outline: 1px solid rgb(255, 0, 0); }';
      document.head.append(style);
    });
    await expect(details.locator('.thread-details')).toHaveCSS('outline-width', '1px');
    await pageWithData.evaluate(() => document.getElementById('thread-details-popup-style-sync-test')?.remove());
  });
});
