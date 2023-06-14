import React from 'react';
import './ThreadDetailsWindow.css';
import ThreadDetailsHeader from './ThreadDetailsHeader';
import ThreadDetailsBody from './ThreadDetailsBody';
import Thread from '../../types/Thread';

type Props = {
  thread: Thread;
};

const ThreadDetailsWindow: React.FC<Props> = ({ thread }) => (
  <div className="thread-details">
    <ThreadDetailsHeader thread={thread} />
    <ThreadDetailsBody thread={thread} />
  </div>
);

export default ThreadDetailsWindow;
