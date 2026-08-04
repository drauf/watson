import React, { type JSX } from 'react';
import HoverPopup from '../common/HoverPopup';
import Thread from '../../types/Thread';
import ThreadDetailsPopup from '../ThreadDetails/ThreadDetailsPopup';
import ThreadDetailsWindow from '../ThreadDetails/ThreadDetailsWindow';
import { openThreadDetailsPopup } from '../ThreadDetails/useOpenThreadDetails';
import type { ThreadDetailsPopupWindow } from '../ThreadDetails/useOpenThreadDetails';
import ThreadOverviewRow from './ThreadOverviewRow';
import type { ThreadOverviewDataRow } from './threadsOverviewRows';

interface Props {
  dates: (string | null)[];
  rows: ThreadOverviewDataRow[];
  matchingStackFilter: Set<number>;
  dumpColumnWidth: number;
  stackPreviewLines: number;
}

interface OpenThreadDetails extends ThreadDetailsPopupWindow {
  thread: Thread;
}

interface State {
  openDetailsVersion: number;
}

export default class ThreadsOverviewTable extends React.PureComponent<Props, State> {
  private readonly openDetails = new Map<number, OpenThreadDetails>();

  private isUnmounting = false;

  public constructor(props: Props) {
    super(props);
    this.state = { openDetailsVersion: 0 };
  }

  public override componentWillUnmount(): void {
    this.isUnmounting = true;
    this.openDetails.forEach(({ popup }) => {
      if (!popup.closed) popup.close();
    });
    this.openDetails.clear();
  }

  private handleOpenThreadDetails = (thread: Thread): void => {
    const existing = this.openDetails.get(thread.uniqueId);
    if (existing && !existing.popup.closed) {
      existing.popup.focus();
      return;
    }

    const popup = openThreadDetailsPopup(thread);
    if (!popup) return;

    this.openDetails.set(thread.uniqueId, { thread, ...popup });
    this.refreshOpenDetails();
  };

  private handleCloseThreadDetails = (uniqueId: number): void => {
    this.openDetails.delete(uniqueId);
    this.refreshOpenDetails();
  };

  private refreshOpenDetails(): void {
    if (this.isUnmounting) return;
    this.setState(({ openDetailsVersion }) => ({ openDetailsVersion: openDetailsVersion + 1 }));
  }

  public override render(): JSX.Element {
    const {
      dates, rows, matchingStackFilter, dumpColumnWidth, stackPreviewLines,
    } = this.props;

    const nameColumnWidth = 240;
    const minimumTableWidth = dumpColumnWidth === 0
      ? undefined
      : nameColumnWidth + (dumpColumnWidth * dates.length);

    return (
      <div className="threads-overview-table-container">
        <table
          className={`threads-overview-table${dumpColumnWidth === 0 ? ' threads-overview-table-fit-columns' : ''}`}
          style={{ minWidth: minimumTableWidth }}
        >
          <colgroup>
            <col className="threads-overview-name-column" style={{ width: nameColumnWidth }} />
            {dates.map((date) => (
              <col
                className="threads-overview-dump-column"
                key={date}
              />
            ))}
          </colgroup>
          <thead>
            <tr>
              <th>Thread Name / Time</th>
              {dates.map((date) => (
                <th key={date}>
                  <HoverPopup content={date || ''}>
                    {date}
                  </HoverPopup>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <ThreadOverviewRow
                key={row.id}
                total={dates.length}
                row={row}
                matchingStackFilter={matchingStackFilter}
                stackPreviewLines={stackPreviewLines}
                onOpenThreadDetails={this.handleOpenThreadDetails}
              />
            ))}
          </tbody>
        </table>
        {Array.from(this.openDetails.values()).map(({ thread, popup, container }) => (
          <ThreadDetailsPopup
            key={thread.uniqueId}
            popup={popup}
            container={container}
            onClose={() => this.handleCloseThreadDetails(thread.uniqueId)}
          >
            <ThreadDetailsWindow thread={thread} />
          </ThreadDetailsPopup>
        ))}
      </div>
    );
  }
}
