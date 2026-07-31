import { expect } from '@playwright/test';
import { expandRepresentativeGroup, test } from './e2e-common';

test.describe('Stuck threads', () => {
  test('loads', async ({ pageWithData }) => {
    await pageWithData.getByText('Stuck threads').click();
    await expandRepresentativeGroup(pageWithData);

    await expect(pageWithData).toHaveScreenshot('Stuck-threads-loads-1.png');
  });
});
