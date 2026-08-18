import { vi } from 'vitest';
import MainThreadParser from '../MainThreadParser';
import { DEFAULT_PERFORMANCE_CONFIG } from '../PerformanceConfig';
import StreamingParser from './StreamingParser';

const createStreamingFile = (contents: string, fileName = '2026_08_10_10_25_00.txt'): File => {
  const file = new File([contents], fileName, { type: 'text/plain' });
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
    const file = createStreamingFile([
      '2026-08-10 10:25:00',
      '"worker" #1 prio=5 tid=0x1 nid=0x1 runnable',
      '   java.lang.Thread.State: RUNNABLE',
      '        at example.Work.run(Work.java:1)',
    ].join('\n'));
    const parser = new StreamingParser(
      1,
      file.size,
      DEFAULT_PERFORMANCE_CONFIG,
      (progress) => progressPhases.push(progress.phase),
    );

    await parser.parseFile(file);
    const threadDumps = parser.finish();

    expect(threadDumps).toHaveLength(1);
    expect(threadDumps[0].threads).toHaveLength(1);
    expect(threadDumps[0].threads[0].stackTrace).toEqual(['example.Work.run(Work.java:1)']);
    expect(progressPhases).toContain('complete');
  });

  it('matches main-thread parsing for multiple dumps and JFR CPU text', async () => {
    const threadDumpContents = [
      '2026-07-21 11:38:03',
      '"Thread-1" #1 prio=5 os_prio=0 cpu=1.00ms elapsed=1.00s tid=0x0000000000000001 nid=3315 runnable',
      '   java.lang.Thread.State: RUNNABLE',
      '        at example.Work.run(Work.java:1)',
      '2026-07-21 11:38:06',
      '"Thread-1" #1 prio=5 os_prio=0 cpu=1.00ms elapsed=1.00s tid=0x0000000000000001 nid=3315 runnable',
      '   java.lang.Thread.State: RUNNABLE',
      '        at example.Work.run(Work.java:2)',
    ].join('\n');
    const cpuUsageContents = [
      'JVM_THREAD_ID OS_THREAD_ID %CPU_USER_MODE %CPU_SYSTEM_MODE SYSTEM_TIME THREAD_NAME',
      '486 3315 24.84% 0.05% 16:39.04 Thread-1',
    ].join('\n');
    const threadDumpFileName = '2026_07_21_11_38_03.txt';
    const cpuUsageFileName = '2026_07_21_11_38_06_thread_cpu_utilisation.txt';
    const mainThreadParsed = vi.fn();
    const mainThreadParser = new MainThreadParser(mainThreadParsed);

    await mainThreadParser.parseFiles([
      new File([threadDumpContents], threadDumpFileName),
      new File([cpuUsageContents], cpuUsageFileName),
    ]);

    const streamingFiles = [
      createStreamingFile(threadDumpContents, threadDumpFileName),
      createStreamingFile(cpuUsageContents, cpuUsageFileName),
    ];
    const streamingParser = new StreamingParser(
      streamingFiles.length,
      streamingFiles.reduce((total, file) => total + file.size, 0),
      DEFAULT_PERFORMANCE_CONFIG,
      () => {},
    );
    for (const file of streamingFiles) {
      // The parser pairs CPU usage with thread dumps after each preceding file is read
      // eslint-disable-next-line no-await-in-loop
      await streamingParser.parseFile(file);
    }
    const streamedThreadDumps = streamingParser.finish();
    const withoutGeneratedThreadIds = (threadDumps: typeof streamedThreadDumps) => threadDumps.map((threadDump) => ({
      ...threadDump,
      threads: threadDump.threads.map(({ uniqueId, ...thread }) => thread),
    }));

    expect(mainThreadParsed).toHaveBeenCalledOnce();
    expect(withoutGeneratedThreadIds(streamedThreadDumps))
      .toEqual(withoutGeneratedThreadIds(mainThreadParsed.mock.calls[0][0]));
  });
});
