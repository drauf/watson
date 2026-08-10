import { expect, test } from '@playwright/test';
import { readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import process from 'node:process';

const benchmarkDirectory = process.env['WATSON_BENCHMARK_DIR'];
const benchmarkDirectoryPath = benchmarkDirectory ?? '';
const traceEnabled = process.env['WATSON_BENCHMARK_TRACE'] === '1';
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
  const tracingSession = traceEnabled ? await page.context().newCDPSession(page) : undefined;
  const tracingComplete = tracingSession === undefined ? undefined : new Promise<string>((resolve, reject) => {
    tracingSession.on('Tracing.tracingComplete', ({ stream }) => {
      if (stream === undefined) {
        reject(new Error('Chromium trace completed without a stream'));
      } else {
        resolve(stream);
      }
    });
  });
  if (tracingSession !== undefined) {
    await tracingSession.send('Tracing.start', {
      categories: 'devtools.timeline,v8,disabled-by-default-v8.cpu_profiler',
      transferMode: 'ReturnAsStream',
    });
  }

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

  let tracePath: string | undefined;
  if (tracingSession !== undefined && tracingComplete !== undefined) {
    await tracingSession.send('Tracing.end');
    const stream = await tracingComplete;
    let trace = '';
    while (true) {
      const { data, eof } = await tracingSession.send('IO.read', { handle: stream });
      trace += data;
      if (eof) break;
    }
    await tracingSession.send('IO.close', { handle: stream });
    tracePath = testInfo.outputPath('parser-performance-trace.json');
    writeFileSync(tracePath, trace);
  }

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
    const measuredAt = performance.now();
    const longTasks = benchmarkData.longTasks.filter((task) => task.startTime >= uploadStartedAt);
    // A long task crossing a phase boundary contributes only its overlap to that phase.
    const summarizeLongTasks = (start: number | undefined, end: number | undefined) => {
      if (start === undefined || end === undefined) return undefined;

      let count = 0;
      let totalMilliseconds = 0;
      let longestMilliseconds = 0;
      for (const task of longTasks) {
        const overlap = Math.max(0, Math.min(task.startTime + task.duration, end) - Math.max(task.startTime, start));
        if (overlap > 0) {
          count++;
          totalMilliseconds += overlap;
          longestMilliseconds = Math.max(longestMilliseconds, overlap);
        }
      }
      return {
        count,
        totalMilliseconds: Number(totalMilliseconds.toFixed(1)),
        longestMilliseconds: Number(longestMilliseconds.toFixed(1)),
      };
    };
    const phaseAt = (name: string): number | undefined => {
      const phaseOffset = phaseMilliseconds[name];
      return phaseOffset === undefined ? undefined : uploadStartedAt + phaseOffset;
    };

    return {
      phaseMilliseconds,
      parserMilliseconds: durationBetween('parser:start', 'parser:complete'),
      readyToStoringStateMilliseconds: durationBetween('parser:ready-to-transfer-received', 'storing:state-committed'),
      storingPaintMilliseconds: durationBetween('storing:state-committed', 'storing:painted'),
      paintedToTransferRequestMilliseconds: durationBetween('storing:painted', 'parser:transfer-result-requested'),
      resultTransferMilliseconds: durationBetween('parser:transfer-result-requested', 'parser:complete'),
      resultReceiptToStorageMilliseconds: durationBetween('parser:complete', 'storage:start'),
      storageMilliseconds: durationBetween('storage:start', 'storage:complete'),
      longTaskSupported: benchmarkData.longTaskSupported,
      longTasksByPhase: {
        parser: summarizeLongTasks(uploadStartedAt, phaseAt('parser:ready-to-transfer-received')),
        readyToStoringState: summarizeLongTasks(phaseAt('parser:ready-to-transfer-received'), phaseAt('storing:state-committed')),
        storingStateToPaint: summarizeLongTasks(phaseAt('storing:state-committed'), phaseAt('storing:painted')),
        paintToTransferRequest: summarizeLongTasks(phaseAt('storing:painted'), phaseAt('parser:transfer-result-requested')),
        resultTransfer: summarizeLongTasks(phaseAt('parser:transfer-result-requested'), phaseAt('parser:complete')),
        storage: summarizeLongTasks(phaseAt('storage:start'), phaseAt('storage:complete')),
        routeRender: summarizeLongTasks(phaseAt('storage:complete'), measuredAt),
      },
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
    tracePath,
    ...result,
  })}\n`);
});
