/// <reference lib="webworker" />

import StreamingParser from './StreamingParser';
import type { WorkerRequest, WorkerResponse } from './protocol';

const workerScope = globalThis as unknown as DedicatedWorkerGlobalScope;

workerScope.onmessage = async (event: MessageEvent<WorkerRequest>) => {
  if (event.data.type !== 'parse') return;

  try {
    const parser = new StreamingParser(
      event.data.files,
      event.data.config,
      (progress) => workerScope.postMessage({ type: 'progress', progress } satisfies WorkerResponse),
    );
    const threadDumps = await parser.parse();
    workerScope.postMessage({ type: 'complete', threadDumps } satisfies WorkerResponse);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown parsing error occurred';
    if (error instanceof Error && error.stack !== undefined) {
      workerScope.postMessage({ type: 'error', message, stack: error.stack } satisfies WorkerResponse);
    } else {
      workerScope.postMessage({ type: 'error', message } satisfies WorkerResponse);
    }
  }
};
