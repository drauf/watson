import { ReactNode, type JSX } from 'react';
import '../Container.css';
import { TimeWindowProvider } from '../../context/TimeWindowContext';
import {
  crossMidnightThreadDumps,
  normalTimeWindowThreadDumps,
} from '../../test-fixtures/threadDumps';
import ThreadDump from '../../types/ThreadDump';
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
