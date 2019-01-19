import React from 'react';
import Thread from '../../types/Thread';
import './ThreadDetailsWindow.css';
import WindowPortal from './WindowPortal';

type ThreadDetailsWindowProps = {
  thread: Thread;
};

const ThreadDetailsWindow: React.SFC<ThreadDetailsWindowProps> = ({ thread }) => (
  <WindowPortal windowTitle={thread.name} className="thread-details">
    <h3>{thread.name}</h3>
    <p>CPU usage: {thread.cpuUsage} | Status: {thread.status} | Running for: {thread.runningFor}</p>
    <p>
      {thread.stackTrace.map(line => `${line}\n`)}
    </p>
  </WindowPortal>
);

export default ThreadDetailsWindow;
