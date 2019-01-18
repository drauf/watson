import React from 'react';
import ThreadDumpsUtils from '../../common/ThreadDumpsUtils';
import Thread from '../../types/Thread';
import ThreadDump from '../../types/ThreadDump';
import ThreadOverviewRow from './ThreadOverviewRow';

type ThreadsOverviewProps = {
  threadDumps: ThreadDump[];
  nameFilter: string;
  stackFilter: string;
};

const ThreadsOverview: React.SFC<ThreadsOverviewProps>
  = ({ threadDumps, nameFilter, stackFilter }) => {
    const threadOverTime = Array.from(ThreadDumpsUtils.getThreadsOverTime(threadDumps).values());
    const filteredDumps = filterThreads(threadOverTime, nameFilter, stackFilter);

    return (
      <table className="threads-overview-table">
        <thead>
          <tr>
            <th />
            {threadDumps.map((threadDump, index) => (
              <th key={index}>{threadDump.date ? threadDump.date.toLocaleTimeString() : null}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filteredDumps.map((threads, index) => (
            <ThreadOverviewRow key={index}
              total={threadDumps.length}
              threads={threads}
              filtered={stackFilter.length > 0}
            />
          ))}
        </tbody>
      </table>
    );
  };

const filterThreads =
  // tslint:disable-next-line:prefer-array-literal
  (threadDumps: Array<Map<number, Thread>>, nameFilter: string, stackFilter: string) => {

    let filtered = threadDumps;
    filtered = filterByName(filtered, nameFilter);
    filtered = filterByStack(filtered, stackFilter);
    return filtered;
  };

// tslint:disable-next-line:prefer-array-literal
const filterByName = (threadDumps: Array<Map<number, Thread>>, nameFilter: string) => {
  if (!nameFilter) {
    return threadDumps;
  }

  let regex: RegExp;
  try {
    regex = new RegExp(nameFilter, 'i');
  } catch {
    return [];
  }

  return threadDumps.filter((threads) => {
    for (const thread of threads) {
      if (regex.test(thread[1].name)) {
        return true;
      }
    }
    return false;
  });
};

// tslint:disable-next-line:prefer-array-literal
const filterByStack = (threadDumps: Array<Map<number, Thread>>, stackFilter: string) => {
  if (!stackFilter) {
    return threadDumps;
  }

  let regex: RegExp;
  try {
    regex = new RegExp(stackFilter, 'i');
  } catch {
    return [];
  }

  // tslint:disable-next-line:prefer-array-literal
  const filtered: Set<Map<number, Thread>> = new Set();
  threadDumps.forEach((threads) => {
    threads.forEach((thread) => {
      for (const line of thread.stackTrace) {
        if (regex.test(line)) {
          thread.matchingFilter = true;
          filtered.add(threads);
          return;
        }
      }
      thread.matchingFilter = false;
    });
  });

  return Array.from(filtered);
};

export default ThreadsOverview;
