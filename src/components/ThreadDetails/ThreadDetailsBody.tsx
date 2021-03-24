import React, { CSSProperties } from 'react';
import Thread from '../../types/Thread';

type Props = {
  thread: Thread;
};

export default class ThreadDetailsBody extends React.PureComponent<Props> {
  private renderWaitingFor = (thread: Thread) => (
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

  private renderLocksHeld = (thread: Thread) => (
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

  private getLineStyles = (line: string): CSSProperties => {
    // anything Atlassian
    if (line.startsWith('com.atlassian')) {
      return { backgroundColor: '#DEEBFF' };
    }

    // database and Lucene
    if (line.startsWith('com.microsoft.sqlserver')
      || line.startsWith('com.mysql.jdbc')
      || line.startsWith('oracle.jdbc')
      || line.startsWith('org.apache.lucene')
      || line.startsWith('org.ofbiz')
      || line.startsWith('org.postgresql')) {
      return { backgroundColor: '#FFFAE6' };
    }

    // "Boring" third parties
    if (line.startsWith('com.google')
      || line.startsWith('com.sun')
      || line.startsWith('io.atlassian')
      || line.startsWith('java.')
      || line.startsWith('javax.')
      || line.startsWith('net.java')
      || line.startsWith('org.apache')
      || line.startsWith('org.codehaus')
      || line.startsWith('org.eclipse')
      || line.startsWith('org.mozilla')
      || line.startsWith('org.springframework')
      || line.startsWith('sun.')
      || line.startsWith('webwork')) {
      return { backgroundColor: '#DFE1E6' };
    }

    // most likely 3rd party apps
    return { backgroundColor: '#E3FCEF' };
  };

  private renderStackTrace = (thread: Thread) => (
    <div id="stacktrace-container">
      <h5>Stack trace</h5>

      {thread.stackTrace.map((line) => <span style={this.getLineStyles(line)}>{line}</span>)}
    </div>
  );

  public render(): JSX.Element {
    const { thread } = this.props;

    return (
      <div className="details-body">
        {this.renderWaitingFor(thread)}
        {this.renderLocksHeld(thread)}
        {this.renderStackTrace(thread)}
      </div>
    );
  }
}
