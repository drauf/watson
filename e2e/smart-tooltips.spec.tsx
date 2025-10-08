import { expect } from '@playwright/test';
import { test } from './e2e-common';

test.describe('Smart tooltips', () => {
    test('shows regex filter tooltips on flame graph page', async ({ pageWithData }) => {
        await pageWithData.getByText('Flame graph').click();
        
        // Test thread name filter tooltip
        await pageWithData.getByText('Thread name pattern').hover();
        await pageWithData.waitForTimeout(100); // Allow tooltip to appear
        
        await expect(pageWithData).toHaveScreenshot('flame-graph-thread-name-tooltip.png');
        
        // Test stack trace filter tooltip  
        await pageWithData.getByText('Stack trace pattern').hover();
        await pageWithData.waitForTimeout(100);
        
        await expect(pageWithData).toHaveScreenshot('flame-graph-stack-trace-tooltip.png');
    });

    test('shows filter tooltips on threads overview page', async ({ pageWithData }) => {
        await pageWithData.getByText('Threads overview').click();
        
        // Test Active filter tooltip
        await pageWithData.getByText('Active').hover();
        await pageWithData.waitForTimeout(100);
        
        await expect(pageWithData).toHaveScreenshot('threads-overview-active-tooltip.png');
        
        // Test High CPU usage filter tooltip
        await pageWithData.getByText('High CPU usage').hover();
        await pageWithData.waitForTimeout(100);
        
        await expect(pageWithData).toHaveScreenshot('threads-overview-cpu-tooltip.png');
    });
});