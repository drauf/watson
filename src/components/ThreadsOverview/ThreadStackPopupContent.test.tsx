import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import Lock from '../../types/Lock';
import Thread from '../../types/Thread';
import ThreadStatus from '../../types/ThreadStatus';
import ThreadStackPopupContent from './ThreadStackPopupContent';

const createThread = (): Thread => {
  const thread = new Thread(1, 'http-nio-8080-exec-42', Date.UTC(2026, 6, 23, 10, 0, 5));
  thread.status = ThreadStatus.BLOCKED;
  thread.cpuUsage = '56.20';
  thread.hasCpuUsage = true;
  thread.lockWaitingFor = new Lock('0x123', 'java.lang.Object');
  thread.locksHeld.push(
    new Lock('0x456', 'java.util.concurrent.locks.ReentrantLock'),
    new Lock('0x789', 'java.lang.Object'),
  );
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
  expect(screen.getByText('Thread state')).toBeInTheDocument();
  expect(screen.getByText('BLOCKED')).toBeInTheDocument();
  expect(screen.getByText('CPU usage')).toBeInTheDocument();
  expect(screen.getByText('56.20%')).toBeInTheDocument();
  expect(screen.getByText('Locks waiting for')).toBeInTheDocument();
  expect(screen.getByText('Locks held')).toBeInTheDocument();
  expect(screen.getByText('1')).toBeInTheDocument();
  expect(screen.getByText('2')).toBeInTheDocument();
  expect(screen.getByText('Click to open thread details in a new window')).toBeInTheDocument();
  expect(screen.getByText('org.apache.lucene.search.IndexSearcher.search(IndexSearcher.java:123)')).toBeInTheDocument();
  expect(screen.getByText('com.atlassian.jira.issue.search.SearchProvider.search(SearchProvider.java:42)')).toBeInTheDocument();
  expect(screen.queryByText('java.base/java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1136)')).not.toBeInTheDocument();
  expect(screen.getByText('+1 more stack line')).toBeInTheDocument();
});

test('uses the plural label for multiple remaining stack lines', () => {
  render(<ThreadStackPopupContent stackPreviewLines={1} thread={createThread()} />);

  expect(screen.getByText('+2 more stack lines')).toBeInTheDocument();
});

test('shows CPU usage from analyses saved before CPU availability was tracked', () => {
  const thread = createThread();
  thread.hasCpuUsage = false;

  render(<ThreadStackPopupContent stackPreviewLines={1} thread={thread} />);

  expect(screen.getByText('CPU usage')).toBeInTheDocument();
  expect(screen.getByText('56.20%')).toBeInTheDocument();
});

test('omits CPU usage when no matching CPU sample is available', () => {
  const thread = createThread();
  thread.hasCpuUsage = false;
  thread.cpuUsage = '0.00';
  thread.runningFor = '0:00.00';

  render(<ThreadStackPopupContent stackPreviewLines={1} thread={thread} />);

  expect(screen.queryByText('CPU usage')).not.toBeInTheDocument();
});
