import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import Thread from '../../types/Thread';
import ThreadStackPopupContent from './ThreadStackPopupContent';

const createThread = (): Thread => {
  const thread = new Thread(1, 'http-nio-8080-exec-42', Date.UTC(2026, 6, 23, 10, 0, 5));
  thread.stackTrace.push(
    'org.apache.lucene.search.IndexSearcher.search(IndexSearcher.java:123)',
    'com.atlassian.jira.issue.search.SearchProvider.search(SearchProvider.java:42)',
    'java.base/java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1136)',
  );
  return thread;
};

test('renders a bounded stack preview with a separator and singular remaining-line count', () => {
  render(<ThreadStackPopupContent stackPreviewLines={2} thread={createThread()} />);

  expect(screen.getByText('10:00:05')).toBeInTheDocument();
  expect(screen.getByRole('separator')).toBeInTheDocument();
  expect(screen.getByText('http-nio-8080-exec-42')).toBeInTheDocument();
  expect(screen.getByText('org.apache.lucene.search.IndexSearcher.search(IndexSearcher.java:123)')).toBeInTheDocument();
  expect(screen.getByText('com.atlassian.jira.issue.search.SearchProvider.search(SearchProvider.java:42)')).toBeInTheDocument();
  expect(screen.queryByText('java.base/java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1136)')).not.toBeInTheDocument();
  expect(screen.getByText('+1 more stack line')).toBeInTheDocument();
});

test('uses the plural label for multiple remaining stack lines', () => {
  render(<ThreadStackPopupContent stackPreviewLines={1} thread={createThread()} />);

  expect(screen.getByText('+2 more stack lines')).toBeInTheDocument();
});
