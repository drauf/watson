/// <reference lib="webworker" />

import type ThreadDump from '../../types/ThreadDump';
import StreamingParser from './StreamingParser';
import type { WorkerRequest, WorkerResponse } from './protocol';

const workerScope = globalThis as unknown as DedicatedWorkerGlobalScope;
let parser: StreamingParser | undefined;
let parsedResult: ThreadDump[] | undefined;

const postError = (error: unknown) => {
  parsedResult = undefined;
  const message = error instanceof Error ? error.message : 'An unknown parsing error occurred';
  if (error instanceof Error && error.stack !== undefined) {
    workerScope.postMessage({ type: 'error', message, stack: error.stack } satisfies WorkerResponse);
  } else {
    workerScope.postMessage({ type: 'error', message } satisfies WorkerResponse);
  }
};

workerScope.onmessage = async (event: MessageEvent<WorkerRequest>) => {
  try {
    if (event.data.type === 'start') {
      parser = new StreamingParser(
        event.data.totalFiles,
        event.data.totalBytes,
        event.data.config,
        (progress) => workerScope.postMessage({ type: 'progress', progress } satisfies WorkerResponse),
      );
      workerScope.postMessage({ type: 'ready-for-file' } satisfies WorkerResponse);
      return;
    }

    if (event.data.type === 'parse-file') {
      if (parser === undefined) {
        throw new Error('Parser session has not started');
      }
      await parser.parseFile(event.data.file);
      workerScope.postMessage({ type: 'ready-for-file' } satisfies WorkerResponse);
      return;
    }

    if (event.data.type === 'finish') {
      if (parser === undefined) {
        throw new Error('Parser session has not started');
      }
      parsedResult = parser.finish();
      parser = undefined;
      workerScope.postMessage({ type: 'ready-to-transfer' } satisfies WorkerResponse);
      return;
    }

    if (event.data.type === 'transfer-result') {
      if (parsedResult === undefined) {
        throw new Error('No parsed result is ready to transfer');
      }

      const result = parsedResult;
      parsedResult = undefined;
      workerScope.postMessage({ type: 'complete', threadDumps: result } satisfies WorkerResponse);
    }
  } catch (error) {
    parser = undefined;
    postError(error);
  }
};
