import { expect } from '@playwright/test';
import { test } from './e2e-common';

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

    await expect(pageWithData).toHaveScreenshot();
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
    await expect(pageWithData).toHaveScreenshot();

    await active.click();
    await tomcat.click();
    await lucene.click();
    await expect(pageWithData).toHaveScreenshot();

    await lucene.click();
    await highCpuUsage.click();
    await expect(pageWithData).toHaveScreenshot();

    await highCpuUsage.click();
    await nonTomcat.click();
    await database.click();
    await expect(pageWithData).toHaveScreenshot();
  });

  test('has working RegExp thread name filter', async ({ pageWithData }) => {
    await pageWithData.getByLabel(NAME_REGEXP).fill('^http');
    await expect(pageWithData).toHaveScreenshot();
  });

  test('has working RegExp stack trace filter', async ({ pageWithData }) => {
    await pageWithData.getByLabel(STACK_REGEXP).fill('(jdk)|(sun)');
    await expect(pageWithData).toHaveScreenshot();
  });

  test('shows an empty state when no threads match', async ({ pageWithData }) => {
    await pageWithData.getByLabel(NAME_REGEXP).fill('^does-not-exist$');

    await expect(pageWithData.getByText('No threads match the selected criteria.')).toBeVisible();
    await expect(pageWithData).toHaveScreenshot();
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
