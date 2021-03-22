import React, { CSSProperties } from 'react';
import Thread from '../../types/Thread';
import './ThreadDetailsWindow.css';
import WindowPortal from './WindowPortal';

type Props = {
  thread: Thread;
  onUnload: () => void;
};

const renderName = (thread: Thread) => (
  <h3>
    {Thread.getFormattedTime(thread)}
    {' '}
    -
    {' '}
    <i>{thread.name}</i>
  </h3>
);

const renderStatus = (thread: Thread) => (
  <div>
    State:
    <span className={`thread-state ${thread.status}`}>
      {thread.status.toLocaleUpperCase()}
    </span>
  </div>
);

const renderRunningFor = (thread: Thread) => (
  <div>
    Running for:
    {' '}
    {thread.runningFor}
  </div>
);

const getCpuUsageClassName = (cpuUsage: number): string => {
  // The numbers here are completely arbitrary
  if (cpuUsage > 78) {
    return 'high';
  }
  if (cpuUsage > 42) {
    return 'medium';
  }
  if (cpuUsage > 10) {
    return 'low';
  }
  return 'none';
};

const renderCpuUsage = (thread: Thread) => (
  <div>
    CPU usage:
    <span className={`thread-state ${getCpuUsageClassName(thread.cpuUsage)}`}>
      {thread.cpuUsage.toFixed(1)}
      %
    </span>
  </div>
);

const renderWaitingFor = (thread: Thread) => (
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

const renderLocksHeld = (thread: Thread) => (
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

const getLineStyles = (line: string): CSSProperties => {
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

const renderStackTrace = (thread: Thread) => (
  <div id="stacktrace-container">
    <h5>Stack trace</h5>

    {thread.stackTrace.map((line) => <span style={getLineStyles(line)}>{line}</span>)}
  </div>
);

const ThreadDetailsWindow: React.FunctionComponent<Props> = ({ thread, onUnload }) => (
  <WindowPortal windowTitle={thread.name} className="thread-details" onUnload={onUnload}>
    <div className="details-header">
      {renderName(thread)}
      {renderStatus(thread)}
      {renderCpuUsage(thread)}
      {renderRunningFor(thread)}
    </div>
    <div className="details-body">
      {renderWaitingFor(thread)}
      {renderLocksHeld(thread)}
      {renderStackTrace(thread)}
    </div>
  </WindowPortal>
);

export default ThreadDetailsWindow;
