import MainThreadParser, { type CompletionCallback, type ProgressCallback } from './MainThreadParser';
import { getPerformanceConfig } from './PerformanceConfig';
import ParserWorker from './worker/parser.worker?worker&inline';
import type { WorkerResponse } from './worker/protocol';

/**
 * Default browser parser. It runs streaming text parsing in an inline module worker
 * and falls back to MainThreadParser when workers are unavailable, such as in tests.
 */
export default class WorkerParser {
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

    await new Promise<void>((resolve, reject) => {
      const worker = new ParserWorker();
      worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
        const message = event.data;
        if (message.type === 'progress') {
          this.onProgress?.(message.progress);
          return;
        }
        worker.terminate();
        if (message.type === 'complete') {
          Promise.resolve(this.onFilesParsed(message.threadDumps)).then(resolve, reject);
          return;
        }
        const error = new Error(message.message);
        if (message.stack !== undefined) {
          error.stack = message.stack;
        }
        reject(error);
      };
      worker.onerror = (event) => {
        worker.terminate();
        reject(new Error(event.message));
      };
      worker.postMessage({ type: 'parse', files, config: getPerformanceConfig() });
    });
  }
}
