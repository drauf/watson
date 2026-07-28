import React from 'react';
import Thread from '../../types/Thread';
import OpenThreadDetailsButton from '../ThreadDetails/OpenThreadDetailsButton';

interface Props {
  thread: Thread;
}

const WaitingListItem: React.FC<Props> = ({ thread }) => (
  <li>
    <OpenThreadDetailsButton text={thread.name} thread={thread} />
  </li>
);

export default React.memo(WaitingListItem);
