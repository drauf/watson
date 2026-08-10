import StreamingParser from './StreamingParser';
import { DEFAULT_PERFORMANCE_CONFIG } from '../PerformanceConfig';

const createStreamingFile = (contents: string): File => {
  const file = new File([contents], '2026_08_10_10_25_00.txt', { type: 'text/plain' });
  const bytes = new TextEncoder().encode(contents);
  Object.defineProperty(file, 'stream', {
    value: () => new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(bytes.slice(0, 17));
        controller.enqueue(bytes.slice(17));
        controller.close();
      },
    }),
  });
  return file;
};

describe('StreamingParser', () => {
  it('parses a thread dump split across stream chunks', async () => {
    const progressPhases: string[] = [];
    const parser = new StreamingParser(
      [createStreamingFile([
        '2026-08-10 10:25:00',
        '"worker" #1 prio=5 tid=0x1 nid=0x1 runnable',
        '   java.lang.Thread.State: RUNNABLE',
        '        at example.Work.run(Work.java:1)',
      ].join('\n'))],
      DEFAULT_PERFORMANCE_CONFIG,
      (progress) => progressPhases.push(progress.phase),
    );

    const threadDumps = await parser.parse();

    expect(threadDumps).toHaveLength(1);
    expect(threadDumps[0].threads).toHaveLength(1);
    expect(threadDumps[0].threads[0].stackTrace).toEqual(['example.Work.run(Work.java:1)']);
    expect(progressPhases).toContain('complete');
  });
});
