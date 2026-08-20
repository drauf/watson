import type { JSX } from 'react';
import { ThreadLabel } from '../../common/threadLabels';
import Thread from '../../types/Thread';
import ThreadStatus from '../../types/ThreadStatus';
import SimilarStacksGroup from './SimilarStacksGroup';

const createThread = (id: number, name: string, timestamp: number): Thread => {
  const thread = new Thread(id, name, timestamp);
  thread.status = ThreadStatus.RUNNABLE;
  thread.labels = [ThreadLabel.HTTP, ThreadLabel.INDEX_SEARCH];
  thread.stackTrace.push(
    'org.apache.lucene.search.IndexSearcher.search(IndexSearcher.java:123)',
    'com.atlassian.jira.issue.search.SearchProvider.search(SearchProvider.java:42)',
    'java.base/java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1136)',
  );
  return thread;
};

const threadGroup = [
  createThread(1, 'http-nio-8080-exec-12', Date.UTC(2026, 6, 23, 10, 0, 0)),
  createThread(2, 'http-nio-8080-exec-18', Date.UTC(2026, 6, 23, 10, 0, 5)),
];

const expandableThreadGroup = Array.from({ length: 21 }, (_, index) => (
  createThread(index + 3, `http-nio-8080-exec-${String(index + 1).padStart(2, '0')}`, Date.UTC(2026, 6, 23, 10, 0, 0))
));

export const ExpandedGroup = (): JSX.Element => (
  <SimilarStacksGroup linesToConsider={3} threadGroup={threadGroup} />
);

export const ExpandableThreadList = (): JSX.Element => (
  <SimilarStacksGroup linesToConsider={3} threadGroup={expandableThreadGroup} />
);

export default ExpandedGroup;
