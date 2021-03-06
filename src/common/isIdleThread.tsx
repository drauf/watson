import Thread from '../types/Thread';

function isRufusThread(thread: Thread): boolean {
  if (!thread.name.includes('rufus-scheduler')) {
    return false;
  }
  return thread.stackTrace[7] === 'org.jruby.ext.thread.Queue$INVOKER$i$pop.call(Queue$INVOKER$i$pop.gen)'
    || thread.stackTrace[3] === 'org.jruby.RubyKernel$INVOKER$s$0$1$sleep.call(RubyKernel$INVOKER$s$0$1$sleep.gen)';
}

function isRubiniusThread(thread: Thread): boolean {
  if (!thread.name.includes('rubinius-actor')) {
    return false;
  }
  return thread.stackTrace[5] === 'org.jruby.ext.rubinius.RubiniusChannel$INVOKER$i$0$0$receive.call(RubiniusChannel$INVOKER$i$0$0$receive.gen)';
}

export default function isIdleThread(thread: Thread): boolean {
  return thread.stackTrace.length < 17
    || isRufusThread(thread)
    || isRubiniusThread(thread);
}
