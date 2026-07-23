import {
  createContext, ReactNode, useCallback, useContext, useMemo, useState,
} from 'react';
import {
  filterThreadDumpsByTimeWindow,
  getDistinctTimestampCount,
  getTimeWindowBounds,
  TimeWindow,
} from '../common/timeWindow';
import ThreadDump from '../types/ThreadDump';

interface TimeWindowContextValue {
  allThreadDumps: ThreadDump[];
  threadDumps: ThreadDump[];
  bounds: TimeWindow | undefined;
  appliedTimeWindow: TimeWindow | undefined;
  previewTimeWindow: TimeWindow | undefined;
  distinctTimestampCount: number;
  setPreviewTimeWindow: (timeWindow?: TimeWindow) => void;
  applyPreviewTimeWindow: () => void;
  resetPreviewTimeWindow: () => void;
}

interface TimeWindowProviderProps {
  children: ReactNode;
  threadDumps: ThreadDump[];
}

const TimeWindowContext = createContext<TimeWindowContextValue | undefined>(undefined);

export const TimeWindowProvider = ({ children, threadDumps }: TimeWindowProviderProps) => {
  const [appliedTimeWindow, setAppliedTimeWindow] = useState<TimeWindow>();
  const [previewTimeWindow, setPreviewTimeWindow] = useState<TimeWindow>();

  const applyPreviewTimeWindow = useCallback(() => {
    setAppliedTimeWindow(previewTimeWindow);
  }, [previewTimeWindow]);

  const resetPreviewTimeWindow = useCallback(() => {
    setPreviewTimeWindow(appliedTimeWindow);
  }, [appliedTimeWindow]);

  const contextValue = useMemo<TimeWindowContextValue>(() => ({
    allThreadDumps: threadDumps,
    threadDumps: filterThreadDumpsByTimeWindow(threadDumps, appliedTimeWindow),
    bounds: getTimeWindowBounds(threadDumps),
    appliedTimeWindow,
    previewTimeWindow,
    distinctTimestampCount: getDistinctTimestampCount(threadDumps),
    setPreviewTimeWindow,
    applyPreviewTimeWindow,
    resetPreviewTimeWindow,
  }), [
    appliedTimeWindow,
    applyPreviewTimeWindow,
    previewTimeWindow,
    resetPreviewTimeWindow,
    threadDumps,
  ]);

  return (
    <TimeWindowContext.Provider value={contextValue}>
      {children}
    </TimeWindowContext.Provider>
  );
};

export const useTimeWindow = (): TimeWindowContextValue => {
  const context = useContext(TimeWindowContext);
  if (!context) {
    throw new Error('useTimeWindow must be used within a TimeWindowProvider');
  }

  return context;
};
