import MainThreadParser, { type CompletionCallback, type ProgressCallback } from './MainThreadParser';
import { getPerformanceConfig } from './PerformanceConfig';
import type { ParseProgress } from './ParseProgress';
import ParserWorker from './worker/parser.worker?worker&inline';
import type { WorkerResponse } from './worker/protocol';

/**
 * Default browser parser. It runs streaming text parsing in an inline module worker
 * and falls back to MainThreadParser when workers are unavailable, such as in tests.
 */
export default class WorkerParser {
  private static markPerformance(phase: string): void {
    if (typeof performance.mark === 'function') {
      performance.mark(`watson:parser:${phase}`);
    }
  }

  public constructor(
    private readonly onFilesParsed: CompletionCallback,
    private readonly onProgress?: ProgressCallback,
  ) {}

  public async parseFiles(files: File[]): Promise<void> {
    if (typeof Worker === 'undefined') {
      const fallbackParser = new MainThreadParser(this.onFilesParsed, this.onProgress);
      await fallbackParser.parseFiles(files);
      return;
    }

    WorkerParser.markPerformance('start');
    await new Promise<void>((resolve, reject) => {
      const worker = new ParserWorker();
      let lastProgressPhase: ParseProgress['phase'] | undefined;
      let progressUpdate = Promise.resolve();
      const finishAfterProgress = (action: () => void | Promise<void>) => {
        progressUpdate.then(action).then(resolve, reject);
      };

      worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
        const message = event.data;
        if (message.type === 'progress') {
          if (message.progress.phase !== lastProgressPhase) {
            WorkerParser.markPerformance(message.progress.phase);
            lastProgressPhase = message.progress.phase;
          }
          progressUpdate = progressUpdate.then(() => this.onProgress?.(message.progress));
          return;
        }

        WorkerParser.markPerformance('complete');
        worker.terminate();
        if (message.type === 'complete') {
          finishAfterProgress(() => this.onFilesParsed(message.threadDumps));
          return;
        }

        const error = new Error(message.message);
        if (message.stack !== undefined) {
          error.stack = message.stack;
        }
        finishAfterProgress(() => Promise.reject(error));
      };
      worker.onerror = (event) => {
        worker.terminate();
        finishAfterProgress(() => Promise.reject(new Error(event.message)));
      };
      worker.postMessage({ type: 'parse', files, config: getPerformanceConfig() });
    });
  }
}
