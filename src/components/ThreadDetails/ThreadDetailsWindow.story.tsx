import React from 'react';
import { ThemeProvider } from '../../context/ThemeContext';
import Lock from '../../types/Lock';
import Thread from '../../types/Thread';
import ThreadStatus from '../../types/ThreadStatus';
import ThreadDetailsWindow from './ThreadDetailsWindow';
import { THREAD_DETAILS_WINDOW_HEIGHT, THREAD_DETAILS_WINDOW_WIDTH } from './useOpenThreadDetails';

const createBlockedThread = (): Thread => {
  const owner = new Thread(2, 'ClusterScheduler-1', Date.UTC(2026, 0, 1, 12, 0, 0));
  const thread = new Thread(1, 'http-nio-8080-exec-42', Date.UTC(2026, 0, 1, 12, 0, 5));
  const waitingFor = new Lock('0x001a', 'java.lang.Object', owner);

  thread.status = ThreadStatus.WAITING;
  thread.cpuUsage = '82.45';
  thread.runningFor = '0:03.25';
  thread.lockWaitingFor = waitingFor;
  thread.locksHeld.push(new Lock('0x00ff', 'java.util.concurrent.locks.ReentrantLock'));
  thread.stackTrace.push(
    'jdk.internal.misc.Unsafe.park(java.base@11.0.11/Native Method)',
    'java.util.concurrent.locks.LockSupport.park(java.base@11.0.11/LockSupport.java:194)',
    'java.util.concurrent.locks.AbstractQueuedSynchronizer.parkAndCheckInterrupt(java.base@11.0.11/AbstractQueuedSynchronizer.java:885)',
    'java.util.concurrent.locks.AbstractQueuedSynchronizer.doAcquireSharedInterruptibly(java.base@11.0.11/AbstractQueuedSynchronizer.java:1039)',
    'java.util.concurrent.locks.AbstractQueuedSynchronizer.acquireSharedInterruptibly(java.base@11.0.11/AbstractQueuedSynchronizer.java:1345)',
    'java.util.concurrent.Semaphore.acquire(java.base@11.0.11/Semaphore.java:318)',
    'com.atlassian.jira.util.concurrent.BoundedExecutor$SemaphoreLock.lock(BoundedExecutor.java:131)',
    'com.atlassian.jira.util.concurrent.BoundedExecutor.execute(BoundedExecutor.java:45)',
    'com.codebarrel.jira.plugin.automation.queue.JiraAutomationQueueExecutor.processClaimedItem(JiraAutomationQueueExecutor.java:213)',
    'com.codebarrel.jira.plugin.automation.queue.JiraAutomationQueueExecutor.access$900(JiraAutomationQueueExecutor.java:72)',
    'com.codebarrel.jira.plugin.automation.queue.JiraAutomationQueueExecutor$QueueClaimer.lambda$run$0(JiraAutomationQueueExecutor.java:371)',
    'com.codebarrel.jira.plugin.automation.queue.JiraAutomationQueueExecutor$QueueClaimer$$Lambda$3550/0x0000000803446440.accept(Unknown Source)',
    'java.util.ArrayList.forEach(java.base@11.0.11/ArrayList.java:1541)',
  );

  return thread;
};

const createRunnableThread = (): Thread => {
  const thread = new Thread(3, 'Catalina-utility-1', Date.UTC(2026, 0, 1, 12, 0, 9));

  thread.status = ThreadStatus.RUNNABLE;
  thread.cpuUsage = '4.10';
  thread.runningFor = '0:00.80';
  thread.stackTrace.push(
    'sun.nio.ch.EPoll.wait(java.base@11.0.11/Native Method)',
    'sun.nio.ch.EPollSelectorImpl.doSelect(java.base@11.0.11/EPollSelectorImpl.java:120)',
    'sun.nio.ch.SelectorImpl.lockAndDoSelect(java.base@11.0.11/SelectorImpl.java:124)',
  );

  return thread;
};

interface StoryProps {
  thread: Thread;
}

const popupSize = {
  width: THREAD_DETAILS_WINDOW_WIDTH,
  height: THREAD_DETAILS_WINDOW_HEIGHT,
  overflow: 'auto',
};

const ThreadDetailsStory: React.FC<StoryProps> = ({ thread }) => (
  <ThemeProvider>
    <div data-testid="thread-details-popup" style={popupSize}>
      <ThreadDetailsWindow thread={thread} />
    </div>
  </ThemeProvider>
);

export const WaitingThreadWithLocks = () => <ThreadDetailsStory thread={createBlockedThread()} />;

export const RunnableThreadWithoutLocks = () => <ThreadDetailsStory thread={createRunnableThread()} />;
