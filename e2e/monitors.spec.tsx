import { expect } from '@playwright/test';
import { expandRepresentativeGroup, test } from './e2e-common';

test.describe('Monitors', () => {
  test('loads', async ({ pageWithData }) => {
    await pageWithData.getByText('Monitors').click();
    await expandRepresentativeGroup(pageWithData);

    await expect(pageWithData).toHaveScreenshot('Monitors-loads-1.png');
  });
});
