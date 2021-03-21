import React from 'react';
import Thread from '../../types/Thread';
import ThreadDetailsWindow from '../ThreadDetails/ThreadDetailsWindow';

type Props = {
  thread: Thread;
};

type State = {
  showDetails: boolean;
  showLockOwner: boolean;
};

export default class ThreadSummary extends React.PureComponent<Props, State> {
  private static locksReducer(accumulator: string, lockId: string, index: number): string {
    return (index === 0) ? lockId : `${accumulator}, ${lockId}`;
  }

  constructor(props: Props) {
    super(props);
    this.state = { showDetails: false, showLockOwner: false };
  }

  private toggleDetails = () => {
    this.setState((prevState) => ({ showDetails: !prevState.showDetails }));
  };

  private toggleLockOwner = () => {
    this.setState((prevState) => ({ showLockOwner: !prevState.showLockOwner }));
  };

  private handleUnload = () => {
    this.setState({ showDetails: false, showLockOwner: false });
  };

  private getLocksHeldString = (thread: Thread): string | null => {
    if (thread.locksHeld.length === 0) {
      return null;
    }
    return thread.locksHeld.map((lock) => lock.id).reduce(ThreadSummary.locksReducer);
  };

  private waitingForRender(thread: Thread, lockOwner: Thread | null) {
    const lockWaitingFor = thread.lockWaitingFor ? thread.lockWaitingFor.id : null;

    if (!lockWaitingFor) {
      return null;
    }

    if (lockOwner) {
      console.error(thread);
      return (
        <>
          , awaiting notification on
          <button type="button" onClick={this.toggleLockOwner}>
            [
            {lockWaitingFor}
            ]
          </button>
        </>
      );
    }
    return `, awaiting notification on [${lockWaitingFor}] without an owner`;
  }

  public render(): JSX.Element {
    const { thread } = this.props;
    const { showDetails, showLockOwner } = this.state;
    const lockOwner = thread.lockWaitingFor ? thread.lockWaitingFor.owner : null;
    const locksHeld = this.getLocksHeldString(thread);

    return (
      <li>
        <button type="button" onClick={this.toggleDetails}>
          &quot;
          {thread.name}
          &quot;
        </button>
        {` ${Thread.getFormattedTime(thread)}`}
        {this.waitingForRender(thread, lockOwner)}
        {thread.locksHeld.length > 0 && `, holding [${locksHeld}]`}

        {showDetails && <ThreadDetailsWindow thread={thread} onUnload={this.handleUnload} />}
        {showLockOwner && lockOwner && <ThreadDetailsWindow thread={lockOwner} onUnload={this.handleUnload} />}
      </li>
    );
  }
}
