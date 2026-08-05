import { expect, test } from '@playwright/test';

test.describe('Threads overview table', () => {
  test('renders a three-dump table with flexible dump columns', async ({ mount }) => {
    const component = await mount('components/ThreadsOverview/ThreadsOverviewTable/Basic');

    await expect(component.getByTestId('three-dump-table')).toHaveScreenshot('threads-overview-three-dump-table.png');
  });

  test('renders bold timestamp headers', async ({ mount }) => {
    const component = await mount('components/ThreadsOverview/ThreadsOverviewTable/Basic');
    const timestampHeader = component
      .getByTestId('three-dump-table')
      .getByRole('columnheader', { name: '10:00:00' });

    const [fontWeight, alignItems] = await timestampHeader.evaluate(
      (element): [number, string] => [
        Number.parseInt(getComputedStyle(element).fontWeight, 10),
        getComputedStyle(element).alignItems,
      ],
    );

    expect(fontWeight).toBeGreaterThanOrEqual(600);
    expect(alignItems).toBe('center');
  });

  test('stretches a small table beyond its configured minimum width', async ({ mount }) => {
    const component = await mount('components/ThreadsOverview/ThreadsOverviewTable/Basic');
    const preview = component.getByTestId('three-dump-table');

    const dimensions = await preview.evaluate((element) => ({
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
    const preview = component.getByTestId('large-table');

    await expect(grid).toHaveAttribute('aria-rowcount', '1000');
    await expect(grid).toHaveAttribute('aria-colcount', '101');
    expect(await component.locator('[role="gridcell"]').count()).toBeLessThan(1000);

    const [previewTop, previewLeft] = await Promise.all([
      preview.evaluate((element) => element.getBoundingClientRect().top),
      preview.evaluate((element) => element.getBoundingClientRect().left),
    ]);
    await preview.evaluate((element) => element.scrollTo({ left: 8000, top: 16000 }));

    await expect(component.getByRole('rowheader', { name: 'worker-500' })).toBeVisible();
    await expect(component.getByText('Thread Name / Time')).toBeVisible();
    await expect.poll(() => component.locator('.threads-overview-grid-header').evaluate(
      (element) => element.getBoundingClientRect().top,
    )).toBeGreaterThanOrEqual(previewTop);
    await expect.poll(() => component.locator('.threads-overview-grid-names').evaluate(
      (element) => element.getBoundingClientRect().left,
    )).toBeGreaterThanOrEqual(previewLeft);
    expect(await component.locator('[role="gridcell"]').count()).toBeLessThan(1000);
  });
});
