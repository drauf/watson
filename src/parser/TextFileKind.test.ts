import { getTextFileKind } from './TextFileKind';

describe('getTextFileKind', () => {
  it('recognizes top CPU output', () => {
    expect(getTextFileKind('top - 10:25:00 up 3 days')).toBe('top-cpu');
  });

  it('recognizes JFR CPU text output', () => {
    expect(getTextFileKind('JVM_THREAD_ID OS_THREAD_ID %CPU_USER_MODE %CPU_SYSTEM_MODE SYSTEM_TIME THREAD_NAME')).toBe('jfr-cpu');
  });

  it('treats all other inputs as thread dumps', () => {
    expect(getTextFileKind('2026-08-10 10:25:00')).toBe('thread-dump');
  });
});
