import { expect, test } from '@playwright/test';

test.describe('Threads overview table', () => {
  test('renders a three-dump table with flexible dump columns', async ({ mount }) => {
    const component = await mount('components/ThreadsOverview/ThreadsOverviewTable/Basic');

    await expect(component.getByTestId('three-dump-table')).toHaveScreenshot('threads-overview-three-dump-table.png');
  });

  test('renders bold timestamp headers', async ({ mount }) => {
    const component = await mount('components/ThreadsOverview/ThreadsOverviewTable/Basic');
    const timestampHeader = component.getByRole('columnheader', { name: '10:00:00' });

    const fontWeight = await timestampHeader.evaluate(
      (element) => Number.parseInt(getComputedStyle(element).fontWeight, 10),
    );

    expect(fontWeight).toBeGreaterThanOrEqual(600);
  });

  test('stretches a small table beyond its configured minimum width', async ({ mount }) => {
    const component = await mount('components/ThreadsOverview/ThreadsOverviewTable/Basic');
    const body = component.getByTestId('three-dump-table').getByTestId('threads-overview-grid-body');

    const dimensions = await body.evaluate((element) => ({
      clientWidth: element.clientWidth,
      scrollWidth: element.scrollWidth,
    }));

    expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth + 1);
  });

  test('renders a many-dump table with horizontal overflow', async ({ mount }) => {
    const component = await mount('components/ThreadsOverview/ThreadsOverviewTable/Basic');

    await expect(component.getByTestId('many-dump-table')).toHaveScreenshot('threads-overview-many-dump-table.png');
  });

  test('virtualizes a large grid while keeping frozen panes synchronized', async ({ mount }) => {
    const component = await mount('components/ThreadsOverview/ThreadsOverviewTable/Large');
    const grid = component.getByRole('grid');
    const body = component.getByTestId('threads-overview-grid-body');

    await expect(grid).toHaveAttribute('aria-rowcount', '1000');
    await expect(grid).toHaveAttribute('aria-colcount', '101');
    expect(await component.locator('[role="gridcell"]').count()).toBeLessThan(1000);

    await body.evaluate((element) => {
      const scrollElement = element as HTMLElement;
      scrollElement.scrollLeft = 8000;
      scrollElement.scrollTop = 14000;
      scrollElement.dispatchEvent(new Event('scroll'));
    });

    await expect(component.getByRole('rowheader', { name: 'worker-500' })).toBeVisible();
    await expect(component.getByText('Thread Name / Time')).toBeVisible();
    await expect.poll(() => component.locator('.threads-overview-grid-header-content').evaluate(
      (element) => (element as HTMLElement).style.transform,
    )).toBe('translateX(-8000px)');
    await expect.poll(() => component.locator('.threads-overview-grid-names-content').evaluate(
      (element) => (element as HTMLElement).style.transform,
    )).toBe('translateY(-14000px)');
    expect(await component.locator('[role="gridcell"]').count()).toBeLessThan(1000);
  });
});
