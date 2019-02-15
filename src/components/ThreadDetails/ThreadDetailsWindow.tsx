import React from 'react';
import Thread from '../../types/Thread';
import ThreadStatus from '../../types/ThreadStatus';
import './ThreadDetailsWindow.css';
import WindowPortal from './WindowPortal';

type ThreadDetailsWindowProps = {
  thread: Thread;
  onUnload: () => void;
};

const ThreadDetailsWindow: React.SFC<ThreadDetailsWindowProps> = ({ thread, onUnload }) => (
  <WindowPortal windowTitle={thread.name} className="thread-details" onUnload={onUnload}>
    {renderName(thread)}
    {renderStatus(thread)}
    {renderLockWaitingFor(thread)}
    {renderLocksHeld(thread)}
    {renderStackTrace(thread)}
  </WindowPortal>
);

const renderName = (thread: Thread) => {
  return (
    <h3>{thread.date ? thread.date.toLocaleTimeString() : ''} <i>{thread.name}</i></h3>
  );
};

const renderStatus = (thread: Thread) => {
  if (thread.status === undefined) {
    return null;
  }

  return (
    <span>
      <b>
        {thread.status.toLocaleUpperCase()}
        {thread.status === ThreadStatus.RUNNABLE &&
          <> ({thread.cpuUsage.toFixed(1)}% CPU usage)</>}
      </b>
      , running for: {thread.runningFor}
    </span>
  );
};

const renderLocksHeld = (thread: Thread) => {
  return (
    thread.locksHeld.length > 0 &&
    <span><b>Locks held:</b> [{thread.locksHeld.join(', ')}]</span>
  );
};

const renderLockWaitingFor = (thread: Thread) => {
  return (
    thread.lockWaitingFor &&
    <span>
      <b>Waiting for notification on lock:</b> [{thread.lockWaitingFor.id}]
        {thread.lockWaitingFor.owner
        ? <> owned by <i>{thread.lockWaitingFor.owner.name}</i></>
        : <> without an owner</>}
    </span>
  );
};

const renderStackTrace = (thread: Thread) => {
  return (
    <textarea
      wrap="off"
      readOnly={true}
      className="monospaced stack-trace"
      value={thread.stackTrace.join('\n')} />
  );
};

export default ThreadDetailsWindow;
