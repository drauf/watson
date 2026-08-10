/// <reference lib="webworker" />

import type ThreadDump from '../../types/ThreadDump';
import StreamingParser from './StreamingParser';
import type { WorkerRequest, WorkerResponse } from './protocol';

const workerScope = globalThis as unknown as DedicatedWorkerGlobalScope;
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
  if (event.data.type === 'transfer-result') {
    if (parsedResult === undefined) {
      postError(new Error('No parsed result is ready to transfer'));
      return;
    }

    const result = parsedResult;
    parsedResult = undefined;
    workerScope.postMessage({ type: 'complete', threadDumps: result } satisfies WorkerResponse);
    return;
  }

  try {
    const parser = new StreamingParser(
      event.data.files,
      event.data.config,
      (progress) => workerScope.postMessage({ type: 'progress', progress } satisfies WorkerResponse),
    );
    parsedResult = await parser.parse();
    workerScope.postMessage({ type: 'ready-to-transfer' } satisfies WorkerResponse);
  } catch (error) {
    postError(error);
  }
};
