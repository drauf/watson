import Button from '@atlaskit/button/new';
import type { JSX } from 'react';
import HoverPopup from '../common/HoverPopup';
import Thread from '../../types/Thread';
import ThreadStackPopupContent from './ThreadStackPopupContent';

const thread = new Thread(1, 'http-nio-8080-exec-42', Date.UTC(2026, 6, 23, 10, 0, 5));
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
