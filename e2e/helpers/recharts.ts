import { Page, expect } from '@playwright/test';

const waitForAnimationFrames = async (frameCount: number): Promise<void> => {
  for (let frame = 0; frame < frameCount; frame += 1) {
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => resolve());
    });
  }
};

export const waitForChartsToSettle = async (page: Page, chartIds: string[]): Promise<void> => {
  await page.waitForFunction(async (ids) => {
    const geometry = ids.map((id) => {
      const chart = document.getElementById(id);
      const wrapper = chart?.querySelector<HTMLElement>('.recharts-wrapper');
      const shapes = [...(chart?.querySelectorAll<SVGPathElement>(
        'path.recharts-sector, path.recharts-curve:not([name="Tooltip data"])',
      ) ?? [])];

      if (!wrapper || wrapper.clientWidth === 0 || wrapper.clientHeight === 0
        || shapes.length === 0 || shapes.some((shape) => !shape.getAttribute('d'))) {
        return undefined;
      }

      return shapes.map((shape) => shape.getAttribute('d')).join('|');
    });

    if (geometry.some((chartGeometry) => chartGeometry === undefined)) {
      return false;
    }

    const initialGeometry = geometry.join('||');
    for (let frame = 0; frame < 10; frame += 1) {
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => resolve());
      });
      const nextGeometry = ids.map((id) => {
        const chart = document.getElementById(id);
        return [...(chart?.querySelectorAll<SVGPathElement>(
          'path.recharts-sector, path.recharts-curve:not([name="Tooltip data"])',
        ) ?? [])].map((shape) => shape.getAttribute('d')).join('|');
      }).join('||');

      if (nextGeometry !== initialGeometry) {
        return false;
      }
    }

    return true;
  }, chartIds);
};

export const waitForTooltipToFinish = async (page: Page): Promise<void> => {
  await expect(page.locator('.smart-tooltip')).toHaveCSS('opacity', '1');
  await page.evaluate(waitForAnimationFrames, 10);
};
