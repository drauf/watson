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

export const getThreadDumpTimestamps = (threadDumps: ThreadDump[]): number[] => (
  [...new Set(threadDumps.map((threadDump) => threadDump.epoch))]
    .sort((first, second) => first - second)
);

export const getDistinctTimestampCount = (threadDumps: ThreadDump[]): number => (
  getThreadDumpTimestamps(threadDumps).length
);

export const getClosestTimestamp = (timestamps: number[], epoch: number): number | undefined => {
  if (timestamps.length === 0) {
    return undefined;
  }

  let low = 0;
  let high = timestamps.length - 1;
  while (low < high) {
    const middle = Math.floor((low + high) / 2);
    if (timestamps[middle] < epoch) {
      low = middle + 1;
    } else {
      high = middle;
    }
  }

  const laterTimestamp = timestamps[low];
  const earlierTimestamp = timestamps[low - 1];
  if (earlierTimestamp === undefined || laterTimestamp - epoch < epoch - earlierTimestamp) {
    return laterTimestamp;
  }

  return earlierTimestamp;
};
