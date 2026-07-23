import React from 'react';
import Thread from '../../types/Thread';
import OpenThreadDetailsButton from '../ThreadDetails/OpenThreadDetailsButton';

interface Props {
  thread: Thread;
}

const WaitingListItem: React.FC<Props> = ({ thread }) => (
  <>
    <OpenThreadDetailsButton text={thread.name} className="waiting-for-lock" thread={thread} />
    <br />
  </>
);

export default React.memo(WaitingListItem);
