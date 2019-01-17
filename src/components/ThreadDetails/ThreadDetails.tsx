import React from 'react';
import Thread from '../../types/Thread';
import './ThreadDetails.css';
import WindowPortal from './WindowPortal';

type ThreadDetailsProps = {
  thread: Thread;
};

const ThreadDetails: React.SFC<ThreadDetailsProps> = ({ thread }) => (
  <WindowPortal windowTitle={thread.name} className="thread-details">
    <h3>{thread.name}</h3>
    <p>CPU usage: {thread.cpuUsage} | Status: {thread.status} | Running for: {thread.runningFor}</p>
    <p>
      {thread.stackTrace.map(line => `${line}\n`)}
    </p>
  </WindowPortal>
);

export default ThreadDetails;
