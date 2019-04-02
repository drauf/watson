import React from 'react';
import Thread from '../../types/Thread';
import ThreadDetails from './ThreadDetails';

type Props = {
  maxDifferingLines: number;
  threadGroup: Thread[];
};

const GroupDetails: React.SFC<Props> = ({ maxDifferingLines, threadGroup }) => {
  return (
    <>
      {threadGroup.map((thread, index) =>
        <ThreadDetails
          key={index}
          thread={thread}
          maxDifferingLines={maxDifferingLines}
        />)}
    </>
  );
};

export default GroupDetails;
