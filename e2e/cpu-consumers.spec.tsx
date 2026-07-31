import { expect } from '@playwright/test';
import { expandRepresentativeGroup, test } from './e2e-common';

test.describe('CPU consumers', () => {
  test('loads', async ({ pageWithData }) => {
    await pageWithData.getByText('CPU consumers').click();
    await expandRepresentativeGroup(pageWithData);

    await expect(pageWithData).toHaveScreenshot('CPU-consumers-loads-1.png');
  });
});
