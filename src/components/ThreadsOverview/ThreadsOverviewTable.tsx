import React from 'react';
import ThreadDetailsPopup from '../ThreadDetails/ThreadDetailsPopup';
import ThreadDetailsWindow from '../ThreadDetails/ThreadDetailsWindow';
import ThreadsOverviewVirtualGrid from './ThreadsOverviewVirtualGrid';
import type { ThreadOverviewDataRow } from './threadsOverviewRows';
import useThreadDetailsWindows from './useThreadDetailsWindows';

interface Props {
  dates: (string | null)[];
  rows: ThreadOverviewDataRow[];
  matchingStackFilter: Set<number>;
  dumpColumnWidth: number;
  stackPreviewLines: number;
  getScrollElement: () => HTMLElement | null;
}

const ThreadsOverviewTable: React.FC<Props> = (props) => {
  const {
    closeThreadDetails,
    openDetails,
    openThreadDetails,
  } = useThreadDetailsWindows();

  return (
    <div className="threads-overview-table-container">
      <ThreadsOverviewVirtualGrid {...props} onOpenThreadDetails={openThreadDetails} />
      {openDetails.map(({ thread, popup, container }) => (
        <ThreadDetailsPopup
          key={thread.uniqueId}
          popup={popup}
          container={container}
          onClose={() => closeThreadDetails(thread.uniqueId)}
        >
          <ThreadDetailsWindow thread={thread} />
        </ThreadDetailsPopup>
      ))}
    </div>
  );
};

export default ThreadsOverviewTable;
