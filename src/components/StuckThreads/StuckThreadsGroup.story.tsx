import type { JSX } from 'react';
import { ThreadLabel } from '../../common/threadLabels';
import Thread from '../../types/Thread';
import ThreadStatus from '../../types/ThreadStatus';
import StuckThreadsGroup from './StuckThreadsGroup';

const createThread = (id: number, timestamp: number, operation: string): Thread => {
  const thread = new Thread(id, 'http-nio-8080-exec-42', timestamp);
  thread.status = ThreadStatus.RUNNABLE;
  thread.labels = [ThreadLabel.HTTP, ThreadLabel.CPU_ACTIVE];
  thread.stackTrace.push(
    `com.atlassian.jira.issue.search.${operation}(SearchService.java:123)`,
    'org.apache.lucene.search.IndexSearcher.search(IndexSearcher.java:456)',
    'java.base/java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1136)',
  );
  return thread;
};

const threadGroup = [
  createThread(1, Date.UTC(2026, 6, 23, 10, 0, 0), 'search'),
  createThread(2, Date.UTC(2026, 6, 23, 10, 0, 5), 'searchCount'),
];

export const ExpandedGroup = (): JSX.Element => (
  <StuckThreadsGroup maxDifferingLines={2} threadGroup={threadGroup} />
);

export default ExpandedGroup;
