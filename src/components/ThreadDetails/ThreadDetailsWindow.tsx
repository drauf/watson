import React from 'react';
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

const renderStatus = (thread: Thread) => {
  if (thread.status === undefined) {
    return (
      <div>
        State:
        <span className="thread-state unknown">UNKNOWN STATE</span>
      </div>
    );
  }

  return (
    <div>
      State:
      <span className={`thread-state ${thread.status}`}>
        {thread.status.toLocaleUpperCase()}
      </span>
    </div>
  );
};

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

const renderStackTrace = (thread: Thread) => (
  <div className="stacktrace-container">
    <h5>Stack trace</h5>

    <textarea
      wrap="off"
      readOnly
      className="stacktrace-textarea"
      value={thread.stackTrace.join('\n')}
    />
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
