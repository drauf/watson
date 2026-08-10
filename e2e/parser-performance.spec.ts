import { expect, test } from '@playwright/test';
import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import process from 'node:process';

const benchmarkDirectory = process.env['WATSON_BENCHMARK_DIR'];
const benchmarkDirectoryPath = benchmarkDirectory ?? '';
const FIRST_PROGRESS_TIMEOUT_MS = 60_000;
const ROUTE_READY_TIMEOUT_MS = 10 * 60_000;
const BENCHMARK_TIMEOUT_MS = 10 * 60_000;

interface LongTask {
  duration: number;
  startTime: number;
}

interface BrowserBenchmarkData {
  longTasks: LongTask[];
  longTaskSupported: boolean;
}

const getBenchmarkFiles = (directory: string): string[] => readdirSync(directory, { withFileTypes: true })
  .filter((entry) => entry.isFile())
  .map((entry) => join(directory, entry.name))
  .sort();

test('measures parser upload performance in Chromium', async ({ page, browserName }, testInfo) => {
  test.skip(!benchmarkDirectory, 'Set WATSON_BENCHMARK_DIR to run the parser benchmark');
  test.skip(browserName !== 'chromium' || testInfo.project.name !== 'chrome-light', 'Runs once in Chrome light mode');
  test.setTimeout(BENCHMARK_TIMEOUT_MS);

  const files = getBenchmarkFiles(benchmarkDirectoryPath);
  const inputBytes = files.reduce((total, filePath) => total + statSync(filePath).size, 0);

  await page.addInitScript(() => {
    performance.clearMarks();
    performance.clearMeasures();

    const longTaskSupported = PerformanceObserver.supportedEntryTypes.includes('longtask');
    const benchmarkData: BrowserBenchmarkData = { longTasks: [], longTaskSupported };
    (window as unknown as { watsonBenchmarkData: BrowserBenchmarkData }).watsonBenchmarkData = benchmarkData;

    if (longTaskSupported) {
      new PerformanceObserver((entries) => {
        for (const entry of entries.getEntries()) {
          benchmarkData.longTasks.push({ duration: entry.duration, startTime: entry.startTime });
        }
      }).observe({ type: 'longtask', buffered: true });
    }
  });

  await page.goto('/');
  const input = page.locator('input[type="file"]');
  await expect(input).toBeAttached();

  const startedAt = await page.evaluate(() => performance.now());
  await input.setInputFiles(files);

  await expect(page.locator('#progress-container')).toBeVisible({ timeout: FIRST_PROGRESS_TIMEOUT_MS });
  const firstProgressAt = await page.evaluate(() => performance.now());

  await expect(page.getByText('Clear data')).toBeVisible({ timeout: ROUTE_READY_TIMEOUT_MS });
  await page.waitForURL(/#\/.+\/(summary|similar-stacks)$/);
  await page.evaluate(async () => new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  }));

  const result = await page.evaluate((uploadStartedAt) => {
    const benchmarkData = (window as unknown as { watsonBenchmarkData: BrowserBenchmarkData }).watsonBenchmarkData;
    const phaseMilliseconds: Record<string, number> = {};
    for (const entry of performance.getEntriesByType('mark')) {
      if (entry.name.startsWith('watson:')) {
        const phase = entry.name.replace('watson:', '');
        if (phaseMilliseconds[phase] === undefined) {
          phaseMilliseconds[phase] = Number((entry.startTime - uploadStartedAt).toFixed(1));
        }
      }
    }
    const durationBetween = (startPhase: string, endPhase: string): number | null => {
      const startMilliseconds = phaseMilliseconds[startPhase];
      const endMilliseconds = phaseMilliseconds[endPhase];
      if (startMilliseconds === undefined || endMilliseconds === undefined) {
        return null;
      }
      return Number((endMilliseconds - startMilliseconds).toFixed(1));
    };
    const internalMilliseconds: Record<string, number> = {};
    for (const entry of performance.getEntriesByType('measure')) {
      if (entry.name.startsWith('watson:')) {
        const name = entry.name.replace('watson:', '');
        internalMilliseconds[name] = Number(((internalMilliseconds[name] ?? 0) + entry.duration).toFixed(1));
      }
    }
    const longTasks = benchmarkData.longTasks.filter((task) => task.startTime >= uploadStartedAt);

    return {
      phaseMilliseconds,
      internalMilliseconds,
      parserMilliseconds: durationBetween('parser:start', 'parser:complete'),
      storageMilliseconds: durationBetween('storage:start', 'storage:complete'),
      longTaskSupported: benchmarkData.longTaskSupported,
      longTaskCount: longTasks.length,
      longestLongTaskMilliseconds: Number(Math.max(0, ...longTasks.map((task) => task.duration)).toFixed(1)),
      totalLongTaskMilliseconds: Number(longTasks.reduce((total, task) => total + task.duration, 0).toFixed(1)),
      route: window.location.hash,
    };
  }, startedAt);
  const completedAt = await page.evaluate(() => performance.now());
  const routeReadyMilliseconds = Number((completedAt - startedAt).toFixed(1));
  const storageCompleteMilliseconds = result.phaseMilliseconds['storage:complete'];
  const postStorageRenderMilliseconds = storageCompleteMilliseconds === undefined
    ? null
    : Number((routeReadyMilliseconds - storageCompleteMilliseconds).toFixed(1));

  process.stdout.write(`${JSON.stringify({
    scenario: 'browser-upload',
    browser: browserName,
    files: files.length,
    inputBytes,
    firstProgressMilliseconds: Number((firstProgressAt - startedAt).toFixed(1)),
    routeReadyMilliseconds,
    postStorageRenderMilliseconds,
    ...result,
  })}\n`);
});
