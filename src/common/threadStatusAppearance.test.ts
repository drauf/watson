import ThreadStatus from '../types/ThreadStatus';
import { getThreadStatusAppearance } from './threadStatusAppearance';

describe('getThreadStatusAppearance', () => {
  it.each([
    [ThreadStatus.RUNNABLE, 'success'],
    [ThreadStatus.BLOCKED, 'danger'],
    [ThreadStatus.WAITING, 'discovery'],
    [ThreadStatus.TIMED_WAITING, 'warning'],
    [ThreadStatus.UNKNOWN, 'neutral'],
  ] as const)('maps %s to the %s Lozenge appearance', (status, appearance) => {
    expect(getThreadStatusAppearance(status)).toBe(appearance);
  });
});
