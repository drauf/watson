import { expect, test } from '@playwright/test';

test.describe('Summary chart tooltip visual states', () => {
  test('renders the running processes tooltip', async ({ mount }) => {
    const component = await mount('components/Summary/TooltipCharts/TooltipCharts');
    const chart = component.locator('#running-processes-chart');

    await chart.locator('.recharts-wrapper').hover();
    await expect(chart).toHaveScreenshot('summary-running-processes-tooltip.png');
  });

  test('renders the memory usage tooltip', async ({ mount }) => {
    const component = await mount('components/Summary/TooltipCharts/TooltipCharts');
    const chart = component.locator('#memory-usage-chart');

    await chart.locator('.recharts-wrapper').hover();
    await expect(chart).toHaveScreenshot('summary-memory-usage-tooltip.png');
  });

  test('renders the load averages tooltip', async ({ mount }) => {
    const component = await mount('components/Summary/TooltipCharts/TooltipCharts');
    const chart = component.locator('#load-averages-chart');

    await chart.locator('.recharts-wrapper').hover();
    await expect(chart).toHaveScreenshot('summary-load-averages-tooltip.png');
  });
});
