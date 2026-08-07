import Thread from '../types/Thread';
import getRepresentativeStackLine from './getRepresentativeStackLine';

const threadWithStack = (stackTrace: string[]): Thread => ({ stackTrace } as Thread);

describe('getRepresentativeStackLine', () => {
  it('returns the first representative stack frame', () => {
    expect(getRepresentativeStackLine([
      threadWithStack([]),
      threadWithStack(['com.example.Work.run(Work.java:1)']),
    ])).toBe('com.example.Work.run(Work.java:1)');
  });

  it('uses a fallback when every stack trace is empty', () => {
    expect(getRepresentativeStackLine([threadWithStack([])])).toBe('Stack trace unavailable');
  });
});
