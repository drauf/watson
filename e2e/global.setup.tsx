import { test as setup } from '@playwright/test';

setup('add no-motion class to body to disable animations', async ({ page }) => {
  await page.addInitScript(() => {
    const addNoMotionClass = () => {
      if (document.body && !document.body.classList.contains('no-motion')) {
        document.body.classList.add('no-motion');
      }
    };

    document.addEventListener('DOMContentLoaded', addNoMotionClass);
    // In case the DOM is already loaded
    addNoMotionClass();
  });
});
