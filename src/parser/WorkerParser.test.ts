import {
  afterEach, beforeEach, describe, expect, it, vi,
} from 'vitest';
import WorkerParser from './WorkerParser';
import type { ParseProgress } from './ParseProgress';

interface MockWorkerInstance {
  onerror: ((event: ErrorEvent) => void) | null;
  onmessage: ((event: MessageEvent) => void) | null;
  postMessage: ReturnType<typeof vi.fn>;
  terminate: ReturnType<typeof vi.fn>;
}

const workerState = vi.hoisted(() => {
  const fallbackParseFiles = vi.fn();
  const workerInstances: MockWorkerInstance[] = [];

  function MockWorker(this: MockWorkerInstance) {
    this.onerror = null;
    this.onmessage = null;
    this.postMessage = vi.fn();
    this.terminate = vi.fn();
    workerInstances.push(this);
  }

  return { fallbackParseFiles, MockWorker, workerInstances };
});

vi.mock('./MainThreadParser', () => ({
  default: function MainThreadParserMock() {
    return { parseFiles: workerState.fallbackParseFiles };
  },
}));

vi.mock('./worker/parser.worker?worker&inline', () => ({ default: workerState.MockWorker }));

const progress: ParseProgress = {
  phase: 'parsing',
  fileName: 'input.txt',
  filesProcessed: 0,
  totalFiles: 1,
  linesProcessed: 1,
  totalLines: 2,
  percentage: 47.5,
};

describe('WorkerParser', () => {
  beforeEach(() => {
    workerState.fallbackParseFiles.mockReset();
    workerState.workerInstances.splice(0);
    vi.stubGlobal('Worker', () => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('forwards worker progress and completion', async () => {
    const onFilesParsed = vi.fn();
    const onProgress = vi.fn();
    const parser = new WorkerParser(onFilesParsed, onProgress);

    const parsing = parser.parseFiles([new File(['contents'], 'input.txt')]);
    const worker = workerState.workerInstances[0];
    expect(worker.postMessage).toHaveBeenCalledOnce();

    worker.onmessage?.({ data: { type: 'progress', progress } } as MessageEvent);
    worker.onmessage?.({ data: { type: 'complete', threadDumps: [] } } as MessageEvent);

    await parsing;

    expect(onProgress).toHaveBeenCalledWith(progress);
    expect(onFilesParsed).toHaveBeenCalledWith([]);
    expect(worker.terminate).toHaveBeenCalledOnce();
  });

  it('propagates worker errors with their stack', async () => {
    const parser = new WorkerParser(vi.fn());

    const parsing = parser.parseFiles([new File(['contents'], 'input.txt')]);
    const worker = workerState.workerInstances[0];
    worker.onmessage?.({ data: { type: 'error', message: 'Parsing failed', stack: 'worker stack' } } as MessageEvent);

    await expect(parsing).rejects.toMatchObject({ message: 'Parsing failed', stack: 'worker stack' });
    expect(worker.terminate).toHaveBeenCalledOnce();
  });

  it('uses the main-thread parser when workers are unavailable', async () => {
    vi.stubGlobal('Worker', undefined);
    const onFilesParsed = vi.fn();
    const parser = new WorkerParser(onFilesParsed);
    const files = [new File(['contents'], 'input.txt')];

    await parser.parseFiles(files);

    expect(workerState.fallbackParseFiles).toHaveBeenCalledWith(files);
    expect(workerState.workerInstances).toHaveLength(0);
  });
});
