import { Page, expect } from '@playwright/test';
import { test } from './e2e-common';

test.describe('Tooltips', () => {
  const waitForAnimationToFinish = async (page: Page) => {
    await page.getByText('root').isVisible();
    // Wait for flame graph animation to complete
    await page.waitForTimeout(750);
  };

  test.describe('Flame Graph Tooltips', () => {
    test.beforeEach(async ({ pageWithData }) => {
      await pageWithData.getByText('Flame graph').click();
      await waitForAnimationToFinish(pageWithData);
    });

    test('shows tooltip on flame graph segment hover', async ({ pageWithData }) => {
      await pageWithData.getByText('root').first().hover();

      await expect(pageWithData).toHaveScreenshot('flame-graph-tooltip-basic.png');
    });

    test('shows detailed information in flame graph tooltip', async ({ pageWithData }) => {
      await pageWithData.getByText('EditIssueActionExecutor').first().hover();

      await expect(pageWithData).toHaveScreenshot('flame-graph-tooltip-detailed.png');
    });

    test('handles tooltip positioning at screen edges', async ({ pageWithData }) => {
      await pageWithData.getByText('DefaultIssueManager.updateIssue @ line 687').first().hover();

      await expect(pageWithData).toHaveScreenshot('flame-graph-tooltip-edge-positioning.png');
    });

    test('tooltip disappears when not hovering', async ({ pageWithData }) => {
      await pageWithData.getByText('root').first().hover();

      // Move away from the segment
      await pageWithData.mouse.move(10, 10);

      // Tooltip should be gone
      await expect(pageWithData).toHaveScreenshot('flame-graph-no-tooltip.png');
    });
  });

  test.describe('Threads Overview Tooltips', () => {
    test.beforeEach(async ({ pageWithData }) => {
      await pageWithData.getByText('Threads overview').click();
    });

    test('shows thread name tooltip on hover', async ({ pageWithData }) => {
      await pageWithData.getByText('http-nio-').first().hover();
      await expect(pageWithData).toHaveScreenshot('threads-tooltip-name.png');
    });

    test('shows stack trace tooltip on method hover', async ({ pageWithData }) => {
      await pageWithData.getByRole('button', { name: 'java.lang.reflect' }).first().hover();
      await expect(pageWithData).toHaveScreenshot('threads-tooltip-stack.png');
    });

    test('tooltip positioning works correctly', async ({ pageWithData }) => {
      // Test tooltip at the bottom-right corner of the page
      await pageWithData.getByRole('button').last().hover();
      await expect(pageWithData).toHaveScreenshot('threads-tooltip-positioning.png');
    });

    test('no tooltip appears on legend hover', async ({ pageWithData }) => {
      await pageWithData.getByText('Timed waiting').hover();
      await expect(pageWithData).toHaveScreenshot('threads-no-tooltip-legend.png');
    });
  });

  test.describe('Summary Page Tooltips', () => {
    test.beforeEach(async ({ pageWithData }) => {
      // todo: there is an animation after charts load - ideally we should wait for some event instead of timeout
      await pageWithData.waitForTimeout(1_500);
    });

    const getRechartsWrapperForChart = (page: Page, chartContainerId: string) => {
      return page.locator(`#${chartContainerId} .recharts-wrapper`).first();
    }

    async function testTooltipForChart(pageWithData: Page, chartId: string) {
      const chartArea = getRechartsWrapperForChart(pageWithData, chartId);

      await chartArea.hover();
      await pageWithData.waitForTimeout(200);
      await expect(pageWithData).toHaveScreenshot(`summary-${chartId}-tooltip.png`);
    }

    test('shows tooltips on chart hover', async ({ pageWithData }) => {
      await testTooltipForChart(pageWithData, 'running-processes-chart');
      await testTooltipForChart(pageWithData, 'memory-usage-chart');
      await testTooltipForChart(pageWithData, 'load-averages-chart');
    });
  });
});
