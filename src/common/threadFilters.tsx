/* eslint-disable @typescript-eslint/no-use-before-define */
import Thread from '../types/Thread';
import ThreadStatus from '../types/ThreadStatus';

// ============================================================================
// TEMPORAL ANALYSIS (Multi-dump analysis for Thread Overview)
// ============================================================================

/**
 * Detects if a thread showed activity across multiple thread dumps.
 *
 * Activity indicators:
 * - Thread status changed between dumps (e.g. BLOCKED → RUNNABLE)
 * - Currently BLOCKED (waiting for locks)
 * - Currently RUNNABLE and not in idle patterns
 *
 * @param threadTimeSeries Same thread sampled across multiple dumps
 * @returns true if thread should be shown in timeline analysis
 */
export function isActiveOverTime(threadTimeSeries: Map<number, Thread>): boolean {
  let previousStatus: ThreadStatus | undefined;

  for (const thread of threadTimeSeries.values()) {
    // Status changed between dumps - thread is active
    if (previousStatus && thread.status !== previousStatus) {
      return true;
    }

    // Thread is blocked (waiting for locks) - shows contention
    if (thread.status === ThreadStatus.BLOCKED) {
      return true;
    }

    // Thread is runnable and not in idle patterns - doing work
    if (thread.status === ThreadStatus.RUNNABLE && !isIdleInSnapshot(thread)) {
      return true;
    }

    previousStatus = thread.status;
  }

  return false;
}

// ============================================================================
// SNAPSHOT ANALYSIS (Point-in-time analysis for other pages)
// ============================================================================

/**
 * Detects if a thread is idle at a specific moment in time.
 *
 * Idle indicators:
 * - Very short stack trace (likely empty or minimal)
 * - I/O polling patterns (epoll, socket operations)
 * - Framework-specific idle patterns (thread pools, schedulers)
 *
 * @param thread Single thread snapshot
 * @returns true if thread should be hidden from analysis
 */
export function isIdleInSnapshot(thread: Thread): boolean {
  const { stackTrace } = thread;

  // Empty or very short stacks are usually idle
  if (!stackTrace || stackTrace.length < 17) {
    return true;
  }
  // On the other hand, longer stacks are rarely idle
  if (stackTrace.length > 35) {
    return false;
  }

  return isIoPollingPattern(stackTrace[0]) || isFrameworkIdlePattern(thread);
}

// ============================================================================
// PATTERN DETECTION HELPERS
// ============================================================================

/**
 * Detects I/O polling patterns that are always idle regardless of thread state.
 * These are optimized for performance - common patterns checked first.
 */
function isIoPollingPattern(topFrame: string): boolean {
  if (!topFrame) return false;

  // Most common I/O polling patterns
  return (
    topFrame.includes('Native Method') && (
      topFrame.includes('epollWait(')
      || topFrame.includes('Net.poll(')
      || topFrame.includes('ServerSocketChannelImpl.accept0(')
      || topFrame.includes('SocketInputStream.socketRead0(')
      || topFrame.includes('PlainSocketImpl.socketAccept(')
      || topFrame.includes('kqueue('))
  ) || topFrame.includes('NioSocketImpl.park(');
}

/**
 * Detects framework-specific idle patterns.
 * More expensive checks, only called for shorter stacks.
 */
function isFrameworkIdlePattern(thread: Thread): boolean {
  return isThreadPoolWaiting(thread)
    || isJavaUtilConcurrentWaiting(thread)
    || isIdleRMIThread(thread)
    || isSleepingJRubyThread(thread)
    || isOkHttpThread(thread)
    || isRufusThread(thread)
    || isRubiniusThread(thread);
}

/**
 * Common thread pool waiting patterns.
 */
function isThreadPoolWaiting(thread: Thread): boolean {
  const { stackTrace } = thread;

  const topFrame = stackTrace[0];
  const secondFrame = stackTrace[1];

  // Classic thread pool patterns - check top frame first (most common)
  if (topFrame?.includes('LinkedBlockingQueue.take')
    || topFrame?.includes('SynchronousQueue.take')
    || topFrame?.includes('DelayedWorkQueue.take')) {
    return true;
  }

  // Modern Java thread pool parking patterns
  if (topFrame?.includes('Unsafe.park(') && secondFrame?.includes('LockSupport.park(')) {
    // Look deeper in stack for thread pool indicators
    return stackTrace.some((frame) => frame.includes('ThreadPoolExecutor.getTask(')
      || frame.includes('DelayedWorkQueue.take(')
      || frame.includes('ScheduledThreadPoolExecutor')
      || frame.includes('ForkJoinPool')
      || frame.includes('ConditionObject.await(')
      || frame.includes('peekOrBlock('));
  }

  return false;
}

// ============================================================================
// FRAMEWORK-SPECIFIC PATTERNS
// ============================================================================

function isIdleRMIThread(thread: Thread): boolean {
  return thread.name.startsWith('RMI');
}

function isSleepingJRubyThread(thread: Thread): boolean {
  return thread.stackTrace[9]?.includes('org.jruby.RubyThread.sleep');
}

function isOkHttpThread(thread: Thread): boolean {
  return thread.name.includes('OkHttp')
    && thread.stackTrace[0]?.includes('sun.nio.ch.Net.poll');
}

function isRufusThread(thread: Thread): boolean {
  if (!thread.name.includes('rufus-scheduler')) {
    return false;
  }

  const stack = thread.stackTrace;
  return (stack[7]?.includes('org.jruby.ext.thread.Queue$INVOKER$i$pop.call'))
    || (stack[3]?.includes('org.jruby.RubyKernel$INVOKER$s$0$1$sleep.call'));
}

function isRubiniusThread(thread: Thread): boolean {
  if (!thread.name.includes('rubinius-actor')) {
    return false;
  }

  return thread.stackTrace[5]?.includes('org.jruby.ext.rubinius.RubiniusChannel$INVOKER$i$0$0$receive.call');
}

/**
 * Modern Java concurrency waiting patterns (Java 8+).
 */
function isJavaUtilConcurrentWaiting(thread: Thread): boolean {
  const { stackTrace } = thread;

  const topFrame = stackTrace[0];

  // CompletableFuture waiting
  if (topFrame?.includes('CompletableFuture.get(')
    || topFrame?.includes('CompletableFuture.join(')) {
    return true;
  }

  // CountDownLatch waiting
  if (topFrame?.includes('CountDownLatch.await(')) {
    return true;
  }

  // Phaser waiting
  if (topFrame?.includes('Phaser.awaitAdvance(')) {
    return true;
  }

  // CyclicBarrier waiting
  if (topFrame?.includes('CyclicBarrier.await(')) {
    return true;
  }

  return false;
}
