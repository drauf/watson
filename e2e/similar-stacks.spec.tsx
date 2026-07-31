import { expect } from '@playwright/test';
import { expandRepresentativeGroup, test } from './e2e-common';

test.describe('Similar stacks', () => {
  test('loads', async ({ pageWithData }) => {
    await pageWithData.getByText('Similar stacks').click();
    await expandRepresentativeGroup(pageWithData);

    await expect(pageWithData).toHaveScreenshot('Similar-stacks-loads-1.png');
  });
});
