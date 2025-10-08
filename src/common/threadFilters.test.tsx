import { isActiveOverTime, isIdleInSnapshot } from './threadFilters';
import Thread from '../types/Thread';
import ThreadStatus from '../types/ThreadStatus';

const createMockThread = (
  name: string,
  status: ThreadStatus,
  stackTrace: string[],
  cpuUsage: string = '0.00',
): Thread => ({
  uniqueId: Math.random(),
  name,
  status,
  stackTrace,
  cpuUsage,
  locksHeld: [],
  lockWaitingFor: undefined,
});

const createStack = (coreFrames: string[], targetLength: number): string[] => {
  const fillerFrames = [
    'java.lang.Thread.run(java.base@17.0.16/Thread.java:840)',
    'java.util.concurrent.ThreadPoolExecutor$Worker.run(java.base@17.0.16/ThreadPoolExecutor.java:635)',
    'java.util.concurrent.ThreadPoolExecutor.runWorker(java.base@17.0.16/ThreadPoolExecutor.java:1136)',
    'java.util.concurrent.FutureTask.run(java.base@17.0.16/FutureTask.java:264)',
    'java.util.concurrent.Executors$RunnableAdapter.call(java.base@17.0.16/Executors.java:539)',
    'com.atlassian.util.concurrent.ManagedLocksExecutorService$ManagedLocksCallable.call(ManagedLocksExecutorService.java:123)',
    'com.atlassian.util.concurrent.SettableFuture$Sync.get(SettableFuture.java:234)',
    'com.atlassian.jira.util.thread.JiraThreadLocalUtils.preCall(JiraThreadLocalUtils.java:45)',
    'org.springframework.security.core.context.SecurityContextHolder.getContext(SecurityContextHolder.java:106)',
    'com.atlassian.jira.security.JiraAuthenticationContext.getLoggedInUser(JiraAuthenticationContext.java:78)',
    'com.atlassian.jira.component.ComponentAccessor.getComponent(ComponentAccessor.java:89)',
    'org.springframework.aop.framework.JdkDynamicAopProxy.invoke(JdkDynamicAopProxy.java:213)',
    'org.springframework.transaction.interceptor.TransactionInterceptor.invoke(TransactionInterceptor.java:118)',
    'org.hibernate.SessionFactory.openSession(SessionFactory.java:456)',
    'org.hibernate.Transaction.begin(Transaction.java:78)',
    'org.apache.struts.action.ActionServlet.process(ActionServlet.java:1194)',
  ];

  const result = [...coreFrames];
  while (result.length < targetLength) {
    const needed = targetLength - result.length;
    result.push(...fillerFrames.slice(0, needed));
  }
  return result.slice(0, targetLength);
};

// Create very long stack traces - always considered active
const createVeryLongStack = (coreFrames: string[], targetLength: number = 40): string[] => createStack(coreFrames, targetLength);

// Create medium-length stack traces for pattern testing
const createMediumStack = (coreFrames: string[], targetLength: number = 25): string[] => createStack(coreFrames, targetLength);

// Create short stack - always considered idle
const createShortStack = (coreFrames: string[], targetLength: number = 12): string[] => createStack(coreFrames, targetLength);

describe('threadFilters', () => {
  describe('isIdleInSnapshot', () => {
    describe('I/O polling patterns', () => {
      it('detects epoll waiting as idle', () => {
        const thread = createMockThread(
          'worker-1',
          ThreadStatus.RUNNABLE,
          createMediumStack(['sun.nio.ch.EPollArrayWrapper.epollWait(Native Method)', 'java.net.ServerSocket.accept()']),
        );
        expect(isIdleInSnapshot(thread)).toBe(true);
      });

      it('detects Net.poll as idle (RMI example)', () => {
        const thread = createMockThread(
          'RMI TCP Connection(7566)-172.30.230.8',
          ThreadStatus.RUNNABLE,
          createMediumStack([
            'sun.nio.ch.Net.poll(java.base@17.0.16/Native Method)',
            'sun.nio.ch.NioSocketImpl.park(java.base@17.0.16/NioSocketImpl.java:186)',
            'sun.rmi.transport.tcp.TCPTransport$ConnectionHandler.run(java.rmi@17.0.16/TCPTransport.java:704)',
          ]),
        );
        expect(isIdleInSnapshot(thread)).toBe(true);
      });

      it('detects socket read as idle', () => {
        const thread = createMockThread(
          'reader-thread',
          ThreadStatus.RUNNABLE,
          createMediumStack(['java.net.SocketInputStream.socketRead0(Native Method)', 'java.io.BufferedInputStream.read()']),
        );
        expect(isIdleInSnapshot(thread)).toBe(true);
      });

      it('detects socket accept as idle', () => {
        const thread = createMockThread(
          'acceptor-thread',
          ThreadStatus.RUNNABLE,
          createMediumStack(['java.net.PlainSocketImpl.socketAccept(Native Method)', 'java.net.ServerSocket.accept()']),
        );
        expect(isIdleInSnapshot(thread)).toBe(true);
      });

      it('detects NioSocketImpl.park as idle', () => {
        const thread = createMockThread(
          'nio-thread',
          ThreadStatus.RUNNABLE,
          createMediumStack(['sun.nio.ch.NioSocketImpl.park(java.base@17.0.16/NioSocketImpl.java:186)']),
        );
        expect(isIdleInSnapshot(thread)).toBe(true);
      });
    });

    describe('thread pool patterns', () => {
      it('detects modern thread pool parking as idle (JiraIndexCommitThread example)', () => {
        const thread = createMockThread(
          'JiraIndexCommitThread-4',
          ThreadStatus.RUNNABLE,
          createMediumStack([
            'jdk.internal.misc.Unsafe.park(java.base@17.0.16/Native Method)',
            'java.util.concurrent.locks.LockSupport.park(java.base@17.0.16/LockSupport.java:341)',
            'java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject.await(java.base@17.0.16/AbstractQueuedSynchronizer.java:1630)',
            'java.util.concurrent.ScheduledThreadPoolExecutor$DelayedWorkQueue.take(java.base@17.0.16/ScheduledThreadPoolExecutor.java:1170)',
            'java.util.concurrent.ThreadPoolExecutor.getTask(java.base@17.0.16/ThreadPoolExecutor.java:1062)',
          ]),
        );
        expect(isIdleInSnapshot(thread)).toBe(true);
      });

      it('detects Catalina utility thread as idle', () => {
        const thread = createMockThread(
          'Catalina-utility-1',
          ThreadStatus.RUNNABLE,
          createMediumStack([
            'jdk.internal.misc.Unsafe.park(java.base@17.0.16/Native Method)',
            'java.util.concurrent.locks.LockSupport.park(java.base@17.0.16/LockSupport.java:341)',
            'java.util.concurrent.ThreadPoolExecutor.getTask(java.base@17.0.16/ThreadPoolExecutor.java:1062)',
            'java.util.concurrent.ThreadPoolExecutor.runWorker(java.base@17.0.16/ThreadPoolExecutor.java:1122)',
          ]),
        );
        expect(isIdleInSnapshot(thread)).toBe(true);
      });

      it('detects localq reader thread as idle', () => {
        const thread = createMockThread(
          'localq-reader-2',
          ThreadStatus.RUNNABLE,
          createMediumStack([
            'jdk.internal.misc.Unsafe.park(java.base@17.0.16/Native Method)',
            'java.util.concurrent.locks.LockSupport.park(java.base@17.0.16/LockSupport.java:341)',
            'com.atlassian.jira.cluster.distribution.localq.tape.TapeLocalQCacheOpQueue.peekOrBlock(TapeLocalQCacheOpQueue.java:245)',
            'com.atlassian.jira.cluster.distribution.localq.LocalQCacheOpReader.run(LocalQCacheOpReader.java:84)',
          ]),
        );
        expect(isIdleInSnapshot(thread)).toBe(true);
      });

      it('detects LinkedBlockingQueue.take as idle', () => {
        const thread = createMockThread(
          'pool-1-thread-1',
          ThreadStatus.WAITING,
          createMediumStack(['java.util.concurrent.LinkedBlockingQueue.take()', 'java.util.concurrent.ThreadPoolExecutor.getTask()']),
        );
        expect(isIdleInSnapshot(thread)).toBe(true);
      });
    });

    describe('framework-specific patterns', () => {
      it('detects RMI connection handler as idle', () => {
        const thread = createMockThread(
          'RMI TCP Connection(123)-host',
          ThreadStatus.RUNNABLE,
          createMediumStack([
            'sun.nio.ch.Net.poll(Native Method)',
            'sun.rmi.transport.tcp.TCPTransport$ConnectionHandler.run(TCPTransport.java:123)',
            'java.lang.Thread.run(Thread.java:840)',
          ]),
        );
        expect(isIdleInSnapshot(thread)).toBe(true);
      });

      it('detects OkHttp thread as idle', () => {
        const thread = createMockThread(
          'OkHttp ConnectionPool',
          ThreadStatus.TIMED_WAITING,
          createMediumStack(['sun.nio.ch.Net.poll(Native Method)', 'okhttp3.ConnectionPool.cleanup()']),
        );
        expect(isIdleInSnapshot(thread)).toBe(true);
      });
    });

    describe('stack length-based filtering', () => {
      it('considers empty stack trace as idle', () => {
        const thread = createMockThread('empty-thread', ThreadStatus.RUNNABLE, []);
        expect(isIdleInSnapshot(thread)).toBe(true);
      });

      it('considers very short stack trace as idle', () => {
        const thread = createMockThread('short-thread', ThreadStatus.RUNNABLE, createShortStack([
          'com.example.BusinessLogic.importantWork()',
          'com.example.Service.process()',
        ], 10));
        // Even business logic is considered idle if stack is short
        expect(isIdleInSnapshot(thread)).toBe(true);
      });

      it('checks patterns for medium stack trace', () => {
        const thread = createMockThread('medium-thread', ThreadStatus.RUNNABLE, createMediumStack([
          'com.example.BusinessLogic.importantWork()',
          'com.example.Service.process()',
        ], 25));
        // Business logic in medium range should NOT be idle (no patterns match)
        expect(isIdleInSnapshot(thread)).toBe(false);
      });

      it('considers very long stack trace as active', () => {
        const thread = createMockThread('long-thread', ThreadStatus.RUNNABLE, createVeryLongStack([
          'sun.nio.ch.EPollArrayWrapper.epollWait(Native Method)',
          'com.example.Service.process()',
        ], 40));
        // Even I/O polling is considered active if stack is long
        expect(isIdleInSnapshot(thread)).toBe(false);
      });
    });

    describe('isActiveOverTime', () => {
      describe('status changes indicate activity', () => {
        it('detects thread that changes from RUNNABLE to BLOCKED as active', () => {
          const threadTimeSeries = new Map<number, Thread>([
            [1, createMockThread('worker-1', ThreadStatus.RUNNABLE, ['com.example.BusinessLogic.work()'])],
            [2, createMockThread('worker-1', ThreadStatus.BLOCKED, ['com.example.BusinessLogic.work()'])],
          ]);
          expect(isActiveOverTime(threadTimeSeries)).toBe(true);
        });

        it('detects thread that changes from BLOCKED to RUNNABLE as active', () => {
          const threadTimeSeries = new Map<number, Thread>([
            [1, createMockThread('worker-1', ThreadStatus.BLOCKED, ['com.example.sync.method()'])],
            [2, createMockThread('worker-1', ThreadStatus.RUNNABLE, ['com.example.BusinessLogic.work()'])],
          ]);
          expect(isActiveOverTime(threadTimeSeries)).toBe(true);
        });

        it('detects thread that changes from WAITING to RUNNABLE as active', () => {
          const threadTimeSeries = new Map<number, Thread>([
            [1, createMockThread('worker-1', ThreadStatus.WAITING, ['java.util.concurrent.LinkedBlockingQueue.take()'])],
            [2, createMockThread('worker-1', ThreadStatus.RUNNABLE, ['com.example.BusinessLogic.processTask()'])],
          ]);
          expect(isActiveOverTime(threadTimeSeries)).toBe(true);
        });
      });

      describe('blocked threads are active (lock contention)', () => {
        it('considers consistently BLOCKED thread as active', () => {
          const threadTimeSeries = new Map<number, Thread>([
            [1, createMockThread('worker-1', ThreadStatus.BLOCKED, ['com.example.sync.method()'])],
            [2, createMockThread('worker-1', ThreadStatus.BLOCKED, ['com.example.sync.method()'])],
          ]);
          expect(isActiveOverTime(threadTimeSeries)).toBe(true);
        });
      });

      describe('runnable non-idle threads are active', () => {
        it('considers RUNNABLE thread doing business logic as active', () => {
          const businessStack = createMediumStack(['com.example.BusinessLogic.work()'], 25);
          const threadTimeSeries = new Map<number, Thread>([
            [1, createMockThread('worker-1', ThreadStatus.RUNNABLE, businessStack)],
            [2, createMockThread('worker-1', ThreadStatus.RUNNABLE, businessStack)],
          ]);
          expect(isActiveOverTime(threadTimeSeries)).toBe(true);
        });

        it('considers RUNNABLE thread doing database work as active', () => {
          const databaseStack = createVeryLongStack(['oracle.jdbc.driver.executeQuery()'], 40);
          const threadTimeSeries = new Map<number, Thread>([
            [1, createMockThread('db-worker', ThreadStatus.RUNNABLE, databaseStack)],
            [2, createMockThread('db-worker', ThreadStatus.RUNNABLE, databaseStack)],
          ]);
          expect(isActiveOverTime(threadTimeSeries)).toBe(true);
        });
      });

      describe('consistently idle threads are not active', () => {
        it('considers consistently RUNNABLE I/O polling thread as not active', () => {
          const threadTimeSeries = new Map<number, Thread>([
            [1, createMockThread('poller', ThreadStatus.RUNNABLE, ['sun.nio.ch.EPollArrayWrapper.epollWait(Native Method)'])],
            [2, createMockThread('poller', ThreadStatus.RUNNABLE, ['sun.nio.ch.EPollArrayWrapper.epollWait(Native Method)'])],
          ]);
          expect(isActiveOverTime(threadTimeSeries)).toBe(false);
        });

        it('considers consistently WAITING queue thread as not active', () => {
          const threadTimeSeries = new Map<number, Thread>([
            [1, createMockThread('pool-worker', ThreadStatus.WAITING, ['java.util.concurrent.LinkedBlockingQueue.take()'])],
            [2, createMockThread('pool-worker', ThreadStatus.WAITING, ['java.util.concurrent.LinkedBlockingQueue.take()'])],
          ]);
          expect(isActiveOverTime(threadTimeSeries)).toBe(false);
        });

        it('considers consistently RUNNABLE thread pool parking as not active', () => {
          const threadTimeSeries = new Map<number, Thread>([
            [1, createMockThread('JiraIndexCommitThread-4', ThreadStatus.RUNNABLE, [
              'jdk.internal.misc.Unsafe.park(Native Method)',
              'java.util.concurrent.ScheduledThreadPoolExecutor$DelayedWorkQueue.take()',
            ])],
            [2, createMockThread('JiraIndexCommitThread-4', ThreadStatus.RUNNABLE, [
              'jdk.internal.misc.Unsafe.park(Native Method)',
              'java.util.concurrent.ScheduledThreadPoolExecutor$DelayedWorkQueue.take()',
            ])],
          ]);
          expect(isActiveOverTime(threadTimeSeries)).toBe(false);
        });
      });

      describe('mixed scenarios', () => {
        it('detects activity when thread alternates between work and idle', () => {
          const threadTimeSeries = new Map<number, Thread>([
            [1, createMockThread('http-worker', ThreadStatus.RUNNABLE, ['com.example.servlet.doGet()'])],
            [2, createMockThread('http-worker', ThreadStatus.WAITING, ['java.util.concurrent.LinkedBlockingQueue.take()'])],
            [3, createMockThread('http-worker', ThreadStatus.RUNNABLE, ['com.example.servlet.doPost()'])],
          ]);
          expect(isActiveOverTime(threadTimeSeries)).toBe(true);
        });

        it('considers single dump with idle pattern as not active', () => {
          const threadTimeSeries = new Map<number, Thread>([
            [1, createMockThread('single-idle', ThreadStatus.RUNNABLE, ['sun.nio.ch.EPollArrayWrapper.epollWait(Native Method)'])],
          ]);
          expect(isActiveOverTime(threadTimeSeries)).toBe(false);
        });

        it('considers single dump with business logic as active', () => {
          const businessStack = createMediumStack(['com.example.BusinessLogic.work()'], 25);
          const threadTimeSeries = new Map<number, Thread>([
            [1, createMockThread('single-active', ThreadStatus.RUNNABLE, businessStack)],
          ]);
          expect(isActiveOverTime(threadTimeSeries)).toBe(true);
        });
      });

      describe('edge cases', () => {
        it('handles empty thread time series', () => {
          const threadTimeSeries = new Map<number, Thread>();
          expect(isActiveOverTime(threadTimeSeries)).toBe(false);
        });

        it('handles thread series with single entry', () => {
          const threadTimeSeries = new Map<number, Thread>([
            [1, createMockThread('single', ThreadStatus.BLOCKED, ['com.example.sync.method()'])],
          ]);
          expect(isActiveOverTime(threadTimeSeries)).toBe(true);
        });
      });
    });
  });
});
