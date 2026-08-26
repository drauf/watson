import Button from '@atlaskit/button/new';
import type { JSX } from 'react';
import HoverPopup from '../common/HoverPopup';
import Lock from '../../types/Lock';
import Thread from '../../types/Thread';
import ThreadStatus from '../../types/ThreadStatus';
import ThreadStackPopupContent from './ThreadStackPopupContent';

const thread = new Thread(1, 'http-nio-8080-exec-42', Date.UTC(2026, 6, 23, 10, 0, 5));
thread.status = ThreadStatus.BLOCKED;
thread.cpuUsage = '56.20';
thread.hasCpuUsage = true;
thread.lockWaitingFor = new Lock('0x123', 'java.lang.Object');
thread.locksHeld.push(new Lock('0x456', 'java.util.concurrent.locks.ReentrantLock'));
thread.stackTrace.push(
  'org.apache.lucene.search.IndexSearcher.search(IndexSearcher.java:123)',
  'com.atlassian.jira.issue.search.SearchProvider.search(SearchProvider.java:42)',
  'java.base/java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1136)',
);

export const TruncatedStackPreview = (): JSX.Element => (
  <HoverPopup renderContent={() => <ThreadStackPopupContent stackPreviewLines={2} thread={thread} />}>
    <Button>Show stack preview</Button>
  </HoverPopup>
);

export default TruncatedStackPreview;
