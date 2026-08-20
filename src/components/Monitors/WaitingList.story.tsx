import type { JSX } from 'react';
import Thread from '../../types/Thread';
import ThreadStatus from '../../types/ThreadStatus';
import WaitingList from './WaitingList';

const waitingThreads = Array.from({ length: 21 }, (_, index) => {
  const thread = new Thread(index + 1, `http-nio-8080-exec-${index + 1}`);
  thread.status = ThreadStatus.WAITING;
  return thread;
});

export const Expandable = (): JSX.Element => (
  <div style={{ width: '360px' }}>
    <WaitingList waiting={waitingThreads} />
  </div>
);

export default Expandable;
