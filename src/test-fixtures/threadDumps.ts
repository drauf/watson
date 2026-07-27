import ThreadDump from '../types/ThreadDump';

export const createThreadDumps = (epochs: number[]): ThreadDump[] => (
  epochs.map((epoch) => new ThreadDump(epoch))
);

export const createSequentialThreadDumps = (
  startEpoch: number,
  count: number,
  intervalMilliseconds = 1000,
): ThreadDump[] => createThreadDumps(Array.from(
  { length: count },
  (_, index) => startEpoch + (index * intervalMilliseconds),
));

export const normalTimeWindowThreadDumps = createSequentialThreadDumps(
  Date.UTC(2026, 6, 23, 9, 0),
  3,
);

export const crossMidnightThreadDumps = createThreadDumps([
  Date.UTC(2026, 6, 23, 23, 59),
  Date.UTC(2026, 6, 24, 0, 1),
]);

export const largeRangeThreadDumps = createSequentialThreadDumps(
  Date.UTC(2026, 6, 23, 9, 0),
  102,
);
