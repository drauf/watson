import { expect, test } from '@playwright/test';

test.describe('Threads overview table', () => {
  test('renders a three-dump table with flexible dump columns', async ({ mount }) => {
    const component = await mount('components/ThreadsOverview/ThreadsOverviewTable/Basic');

    await expect(component.getByTestId('three-dump-table')).toHaveScreenshot('threads-overview-three-dump-table.png');
  });

  test('renders a many-dump table with horizontal overflow', async ({ mount }) => {
    const component = await mount('components/ThreadsOverview/ThreadsOverviewTable/Basic');

    await expect(component.getByTestId('many-dump-table')).toHaveScreenshot('threads-overview-many-dump-table.png');
  });
});
