import React from 'react';
import Thread from '../../types/Thread';
import ThreadDetails from '../ThreadDetails/ThreadDetails';

type Props = {
  thread: Thread;
};

export default class ThreadSummary extends React.PureComponent<Props> {
  private static locksReducer = (previousLocks: string, lockId: string, index: number): string => ((index === 0) ? lockId : `${previousLocks}, ${lockId}`);

  private static getLocksHeldString = (thread: Thread): string => {
    if (thread.locksHeld.length === 0) {
      return '';
    }
    return thread.locksHeld.map((lock) => lock.id).reduce(ThreadSummary.locksReducer);
  };

  private static waitingForRender = (thread: Thread, lockOwner?: Thread) => {
    const lockWaitingFor = thread.lockWaitingFor ? thread.lockWaitingFor.id : null;

    if (!lockWaitingFor) {
      return null;
    }

    if (lockOwner) {
      return (
        <>
          , awaiting notification on
          {' '}
          <ThreadDetails text={`[${lockWaitingFor}]`} className="lock-owner" thread={lockOwner} />
        </>
      );
    }
    return `, awaiting notification on [${lockWaitingFor}] without an owner`;
  };

  public render(): JSX.Element {
    const { thread } = this.props;
    const lockOwner = thread.lockWaitingFor ? thread.lockWaitingFor.owner : undefined;
    const locksHeld = ThreadSummary.getLocksHeldString(thread);

    return (
      <li>
        <ThreadDetails text={`"${thread.name}"`} className="thread-summary" thread={thread} />
        {` ${Thread.getFormattedTime(thread)}`}
        {ThreadSummary.waitingForRender(thread, lockOwner)}
        {thread.locksHeld.length > 0 && `, holding [${locksHeld}]`}
      </li>
    );
  }
}
