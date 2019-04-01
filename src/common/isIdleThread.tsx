import Thread from '../types/Thread';

export default function isIdleThread(thread: Thread): boolean {
  return thread.stackTrace.length < 17;
}
