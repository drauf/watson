import { ReactNode, useEffect } from 'react';
import '../Container.css';
import { TimeWindowProvider, useTimeWindow } from '../../context/TimeWindowContext';
import {
  crossMidnightThreadDumps,
  largeRangeThreadDumps,
  normalTimeWindowThreadDumps,
} from '../../test-fixtures/threadDumps';
import ThreadDump from '../../types/ThreadDump';
import LargeRangeConfirmationDialog from './LargeRangeConfirmationDialog';
import TimeWindowFilter from './TimeWindowFilter';

interface StoryProps {
  threadDumps: ThreadDump[];
  children: ReactNode;
}

const TimeWindowStory = ({ threadDumps, children }: StoryProps): JSX.Element => (
  <TimeWindowProvider threadDumps={threadDumps}>
    <main>
      <section id="settings" style={{ width: '100%' }}>
        {children}
      </section>
    </main>
  </TimeWindowProvider>
);

const PendingLargeRange = (): JSX.Element => {
  const { bounds, setPreviewTimeWindow } = useTimeWindow();

  useEffect(() => {
    if (!bounds) {
      return;
    }

    setPreviewTimeWindow({
      startEpoch: bounds.startEpoch + 1000,
      endEpoch: bounds.endEpoch,
    });
  }, [bounds, setPreviewTimeWindow]);

  return <TimeWindowFilter />;
};

export const Normal = (): JSX.Element => (
  <TimeWindowStory threadDumps={normalTimeWindowThreadDumps}>
    <TimeWindowFilter />
  </TimeWindowStory>
);

export const CrossMidnight = (): JSX.Element => (
  <TimeWindowStory threadDumps={crossMidnightThreadDumps}>
    <TimeWindowFilter />
  </TimeWindowStory>
);

export const PendingLargeRangeWarning = (): JSX.Element => (
  <TimeWindowStory threadDumps={largeRangeThreadDumps}>
    <PendingLargeRange />
  </TimeWindowStory>
);

export const LargeRangeDialog = (): JSX.Element => (
  <LargeRangeConfirmationDialog
    message="The selected time window covers 294 thread dumps from 2026-07-23 23:55:00 to 2026-07-24 00:10:00. Large time windows can slow analysis pages."
    onClose={() => undefined}
    onAnalyze={() => undefined}
  />
);
