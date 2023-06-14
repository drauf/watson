import React from 'react';
import Thread from '../../types/Thread';
import ThreadDetails from '../ThreadDetails/ThreadDetails';

type Props = {
  thread: Thread;
};

const WaitingListItem: React.FC<Props> = ({ thread }) => (
  <>
    <ThreadDetails text={thread.name} className="waiting-for-lock" thread={thread} />
    <br />
  </>
);

export default React.memo(WaitingListItem);
