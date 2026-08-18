import MainThreadParser, { type CompletionCallback, type ProgressCallback } from './MainThreadParser';
import { getPerformanceConfig } from './PerformanceConfig';
import type { ParseProgress } from './ParseProgress';
import ParserWorker from './worker/parser.worker?worker&inline';
import type { WorkerResponse } from './worker/protocol';

export type ReadyToTransferCallback = () => void | Promise<void>;

export interface FileSource {
  totalFiles: number | undefined;
  totalBytes: number;
  files: AsyncIterable<File>;
}
/**
 * Default browser parser. It runs streaming text parsing in an inline module worker
 * and falls back to MainThreadParser when workers are unavailable, such as in tests.
 */
export default class WorkerParser {
  public constructor(
    private readonly onFilesParsed: CompletionCallback,
    private readonly onProgress?: ProgressCallback,
    private readonly onReadyToTransfer?: ReadyToTransferCallback,
  ) {}

  public async parseFiles(files: File[]): Promise<void> {
    async function* fileSource(): AsyncGenerator<File> {
      yield* files;
    }

    const totalBytes = files.reduce((total, file) => total + file.size, 0);
    await this.parseFileSource({
      totalFiles: files.length,
      totalBytes,
      files: fileSource(),
    });
  }

  public async parseFileSource(source: FileSource): Promise<void> {
    if (typeof Worker === 'undefined') {
      const files: File[] = [];
      for await (const file of source.files) {
        files.push(file);
      }
      const fallbackParser = new MainThreadParser(this.onFilesParsed, this.onProgress);
      await fallbackParser.parseFiles(files);
      return;
    }

    await new Promise<void>((resolve, reject) => {
      const worker = new ParserWorker();
      const iterator = source.files[Symbol.asyncIterator]();
      let latestProgress: ParseProgress | undefined;
      let progressDelivery: Promise<void> | undefined;
      let terminalAction: (() => void | Promise<void>) | undefined;
      let requestingFile = false;

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

      const requestNextFile = async () => {
        if (requestingFile) return;
        requestingFile = true;
        try {
          const next = await iterator.next();
          if (next.done) {
            worker.postMessage({ type: 'finish' });
          } else {
            worker.postMessage({ type: 'parse-file', file: next.value });
          }
        } catch (error) {
          worker.terminate();
          reject(error);
        } finally {
          requestingFile = false;
        }
      };

      const prepareResultTransfer = async () => {
        latestProgress = undefined;
        await progressDelivery;
        await this.onReadyToTransfer?.();
        worker.postMessage({ type: 'transfer-result' });
      };

      worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
        const message = event.data;
        if (message.type === 'ready-for-file') {
          requestNextFile().catch(reject);
          return;
        }

        if (message.type === 'progress') {
          latestProgress = message.progress;
          deliverLatestProgress();
          return;
        }

        if (message.type === 'ready-to-transfer') {
          prepareResultTransfer().catch((error: unknown) => {
            worker.terminate();
            reject(error);
          });
          return;
        }

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
      worker.postMessage({
        type: 'start',
        totalFiles: source.totalFiles,
        totalBytes: source.totalBytes,
        config: getPerformanceConfig(),
      });
    });
  }
}
