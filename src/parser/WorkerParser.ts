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
      let latestProgress: ParseProgress | undefined;
      let progressDelivery: Promise<void> | undefined;
      let terminalAction: (() => void | Promise<void>) | undefined;

      const finish = () => {
        if (terminalAction === undefined) return;
        const action = terminalAction;
        terminalAction = undefined;
        Promise.resolve(action()).then(resolve, reject);
      };

      const deliverLatestProgress = () => {
        if (progressDelivery !== undefined || latestProgress === undefined) {
          if (progressDelivery === undefined && latestProgress === undefined) {
            finish();
          }
          return;
        }

        const progress = latestProgress;
        latestProgress = undefined;
        progressDelivery = Promise.resolve(this.onProgress?.(progress));
        progressDelivery.then(() => {
          progressDelivery = undefined;
          deliverLatestProgress();
        }, reject);
      };

      worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
        const message = event.data;
        if (message.type === 'progress') {
          if (message.progress.phase !== lastProgressPhase) {
            WorkerParser.markPerformance(message.progress.phase);
            lastProgressPhase = message.progress.phase;
          }
          latestProgress = message.progress;
          deliverLatestProgress();
          return;
        }

        WorkerParser.markPerformance('complete');
        worker.terminate();
        if (message.type === 'complete') {
          terminalAction = () => this.onFilesParsed(message.threadDumps);
        } else {
          const error = new Error(message.message);
          if (message.stack !== undefined) {
            error.stack = message.stack;
          }
          terminalAction = () => Promise.reject(error);
        }
        deliverLatestProgress();
      };
      worker.onerror = (event) => {
        worker.terminate();
        terminalAction = () => Promise.reject(new Error(event.message));
        deliverLatestProgress();
      };
      worker.postMessage({ type: 'parse', files, config: getPerformanceConfig() });
    });
  }
}
