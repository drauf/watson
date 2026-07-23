import ThreadDump from '../types/ThreadDump';

export interface TimeWindow {
  startEpoch: number;
  endEpoch: number;
}

export const filterThreadDumpsByTimeWindow = (
  threadDumps: ThreadDump[],
  timeWindow?: TimeWindow,
): ThreadDump[] => {
  if (!timeWindow) {
    return threadDumps;
  }

  return threadDumps.filter((threadDump) => (
    threadDump.epoch >= timeWindow.startEpoch
    && threadDump.epoch <= timeWindow.endEpoch
  ));
};

export const getTimeWindowBounds = (threadDumps: ThreadDump[]): TimeWindow | undefined => {
  if (threadDumps.length === 0) {
    return undefined;
  }

  return threadDumps.reduce<TimeWindow>(
    (bounds, threadDump) => ({
      startEpoch: Math.min(bounds.startEpoch, threadDump.epoch),
      endEpoch: Math.max(bounds.endEpoch, threadDump.epoch),
    }),
    {
      startEpoch: threadDumps[0].epoch,
      endEpoch: threadDumps[0].epoch,
    },
  );
};

export const getDistinctTimestampCount = (threadDumps: ThreadDump[]): number => (
  new Set(threadDumps.map((threadDump) => threadDump.epoch)).size
);
