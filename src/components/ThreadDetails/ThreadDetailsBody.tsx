import React, { CSSProperties } from 'react';
import getColorForStackLine from '../../common/getColorForStackLine';
import Thread from '../../types/Thread';

type Props = {
  thread: Thread;
};

export default class ThreadDetailsBody extends React.PureComponent<Props> {
  private static renderWaitingFor = (thread: Thread) => (
    <div>
      <h5>Waiting for</h5>

      {!thread.lockWaitingFor
      && <span>This thread is not waiting for notification on any lock</span>}

      {thread.lockWaitingFor
      && (
        <span>
          This thread is waiting for notification on lock [
          {thread.lockWaitingFor.id}
          ]
          {thread.lockWaitingFor.owner
            ? (
              <>
                {' '}
                owned by
                {' '}
                <i>{thread.lockWaitingFor.owner.name}</i>
              </>
            )
            : <> without an owner</>}
        </span>
      )}
    </div>
  );

  private static renderLocksHeld = (thread: Thread) => (
    <div>
      <h5>Locks held</h5>

      {thread.locksHeld.length === 0
      && <span>This thread does not hold any locks</span>}

      {thread.locksHeld.length > 0
      && (
        <span>
          This thread holds [
          {thread.locksHeld.map((lock) => lock.id).join(', ')}
          ]
        </span>
      )}
    </div>
  );

  private static getLineStyles = (line: string): CSSProperties => ({ backgroundColor: getColorForStackLine(line) });

  private static renderStackTrace = (thread: Thread) => (
    <div className="stacktrace-container">
      <h5>Stack trace</h5>

      {thread.stackTrace.map((line) => <code style={ThreadDetailsBody.getLineStyles(line)}>{line}</code>)}
    </div>
  );

  public override render(): JSX.Element {
    const { thread } = this.props;

    return (
      <>
        <div className="details-body">
          {ThreadDetailsBody.renderWaitingFor(thread)}
          {ThreadDetailsBody.renderLocksHeld(thread)}
        </div>

        {ThreadDetailsBody.renderStackTrace(thread)}
      </>
    );
  }
}
