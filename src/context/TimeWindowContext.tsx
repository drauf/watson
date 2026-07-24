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

interface TimeWindowDataContextValue {
  allThreadDumps: ThreadDump[];
  threadDumps: ThreadDump[];
  bounds: TimeWindow | undefined;
  appliedTimeWindow: TimeWindow | undefined;
  distinctTimestampCount: number;
}

interface TimeWindowControlsContextValue {
  previewTimeWindow: TimeWindow | undefined;
  setPreviewTimeWindow: (timeWindow?: TimeWindow) => void;
  applyPreviewTimeWindow: () => void;
  resetPreviewTimeWindow: () => void;
}

interface TimeWindowProviderProps {
  children: ReactNode;
  threadDumps: ThreadDump[];
}

const TimeWindowDataContext = createContext<TimeWindowDataContextValue | undefined>(undefined);
const TimeWindowControlsContext = createContext<TimeWindowControlsContextValue | undefined>(undefined);

const timeWindowsEqual = (
  first: TimeWindow | undefined,
  second: TimeWindow | undefined,
): boolean => (
  first === second
  || (first !== undefined
    && second !== undefined
    && first.startEpoch === second.startEpoch
    && first.endEpoch === second.endEpoch)
);

export const TimeWindowProvider = ({ children, threadDumps }: TimeWindowProviderProps) => {
  const [appliedTimeWindow, setAppliedTimeWindow] = useState<TimeWindow>();
  const [previewTimeWindow, setPreviewTimeWindowState] = useState<TimeWindow>();
  const bounds = useMemo(() => getTimeWindowBounds(threadDumps), [threadDumps]);
  const distinctTimestampCount = useMemo(() => getDistinctTimestampCount(threadDumps), [threadDumps]);
  const activeThreadDumps = useMemo(
    () => filterThreadDumpsByTimeWindow(threadDumps, appliedTimeWindow),
    [appliedTimeWindow, threadDumps],
  );

  const setPreviewTimeWindow = useCallback((timeWindow?: TimeWindow) => {
    setPreviewTimeWindowState((current) => (
      timeWindowsEqual(current, timeWindow) ? current : timeWindow
    ));
  }, []);

  const applyPreviewTimeWindow = useCallback(() => {
    setAppliedTimeWindow((current) => (
      timeWindowsEqual(current, previewTimeWindow) ? current : previewTimeWindow
    ));
  }, [previewTimeWindow]);

  const resetPreviewTimeWindow = useCallback(() => {
    setPreviewTimeWindow(appliedTimeWindow);
  }, [appliedTimeWindow, setPreviewTimeWindow]);

  const dataContextValue = useMemo<TimeWindowDataContextValue>(() => ({
    allThreadDumps: threadDumps,
    threadDumps: activeThreadDumps,
    bounds,
    appliedTimeWindow,
    distinctTimestampCount,
  }), [
    activeThreadDumps,
    appliedTimeWindow,
    bounds,
    distinctTimestampCount,
    threadDumps,
  ]);
  const controlsContextValue = useMemo<TimeWindowControlsContextValue>(() => ({
    previewTimeWindow,
    setPreviewTimeWindow,
    applyPreviewTimeWindow,
    resetPreviewTimeWindow,
  }), [
    applyPreviewTimeWindow,
    previewTimeWindow,
    resetPreviewTimeWindow,
    setPreviewTimeWindow,
  ]);

  return (
    <TimeWindowDataContext.Provider value={dataContextValue}>
      <TimeWindowControlsContext.Provider value={controlsContextValue}>
        {children}
      </TimeWindowControlsContext.Provider>
    </TimeWindowDataContext.Provider>
  );
};

export const useTimeWindowData = (): TimeWindowDataContextValue => {
  const context = useContext(TimeWindowDataContext);
  if (!context) {
    throw new Error('useTimeWindowData must be used within a TimeWindowProvider');
  }

  return context;
};

const useTimeWindowControls = (): TimeWindowControlsContextValue => {
  const context = useContext(TimeWindowControlsContext);
  if (!context) {
    throw new Error('useTimeWindowControls must be used within a TimeWindowProvider');
  }

  return context;
};

export const useTimeWindow = (): TimeWindowDataContextValue & TimeWindowControlsContextValue => ({
  ...useTimeWindowData(),
  ...useTimeWindowControls(),
});
