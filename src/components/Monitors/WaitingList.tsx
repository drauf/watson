import React from 'react';
import Thread from '../../types/Thread';
import WaitingListItem from './WaitingListItem';

type WaitingListProps = {
  waiting: Thread[],
};

const WaitingList: React.SFC<WaitingListProps> = ({ waiting }) => (
  <ul className="waiting-list">
    {waiting.map((thread, index) => <WaitingListItem thread={thread} key={index} />)}
  </ul>
);

export default WaitingList;
