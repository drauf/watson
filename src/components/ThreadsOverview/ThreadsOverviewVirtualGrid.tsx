import { useVirtualizer } from '@tanstack/react-virtual';
import React, {
  useCallback, useEffect, useLayoutEffect, useRef, useState,
} from 'react';
import Thread from '../../types/Thread';
import HoverPopup from '../common/HoverPopup';
import ThreadsOverviewItem from './ThreadOverviewItem';
import {
  getResolvedThreadsOverviewDumpColumnWidth,
  threadsOverviewGridMetrics,
} from './threadsOverviewGridMetrics';
import type { ThreadOverviewDataRow } from './threadsOverviewRows';

interface Props {
  dates: (string | null)[];
  rows: ThreadOverviewDataRow[];
  matchingStackFilter: Set<number>;
  dumpColumnWidth: number;
  stackPreviewLines: number;
  getScrollElement: () => HTMLElement | null;
  onOpenThreadDetails: (thread: Thread) => void;
}
// The workspace owns both scroll axes. Frozen panes are CSS-sticky while cells
// remain absolutely positioned and virtualized within the grid's content area.
const ThreadsOverviewVirtualGrid: React.FC<Props> = ({
  dates,
  rows,
  matchingStackFilter,
  dumpColumnWidth,
  stackPreviewLines,
  getScrollElement,
  onOpenThreadDetails,
}) => {
  const gridRef = useRef<HTMLDivElement>(null);
  const [bodyWidth, setBodyWidth] = useState(0);
  const [rowScrollMargin, setRowScrollMargin] = useState(0);

  const resolvedDumpColumnWidth = getResolvedThreadsOverviewDumpColumnWidth(
    dumpColumnWidth,
    dates.length,
    bodyWidth,
  );

  // TanStack Virtual owns external scroll state, which React Compiler cannot memoize safely.
  // eslint-disable-next-line react-hooks/incompatible-library
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement,
    estimateSize: () => threadsOverviewGridMetrics.rowHeight,
    getItemKey: (index) => rows[index].id,
    initialRect: { width: 1024, height: 700 },
    overscan: 2,
    scrollMargin: rowScrollMargin,
  });
  // Index zero reserves the frozen thread-name column in the shared horizontal scroll space.

  const columnVirtualizer = useVirtualizer({
    count: dates.length + 1,
    getScrollElement,
    horizontal: true,
    estimateSize: (index) => (
      index === 0 ? threadsOverviewGridMetrics.threadNameColumnWidth : resolvedDumpColumnWidth
    ),
    initialRect: { width: 1024, height: 700 },
    overscan: 1,
  });

  const updateWorkspaceLayout = useCallback(() => {
    const grid = gridRef.current;
    const scrollElement = getScrollElement();
    if (!grid || !scrollElement) return;

    const gridRect = grid.getBoundingClientRect();
    const scrollRect = scrollElement.getBoundingClientRect();
    const nextMargin = Math.max(
      0,
      gridRect.top - scrollRect.top + scrollElement.scrollTop + threadsOverviewGridMetrics.headerHeight,
    );

    setRowScrollMargin((currentMargin) => (
      currentMargin === nextMargin ? currentMargin : nextMargin
    ));
    setBodyWidth(Math.max(0, scrollElement.clientWidth - threadsOverviewGridMetrics.threadNameColumnWidth));
  }, [getScrollElement]);

  useLayoutEffect(() => {
    updateWorkspaceLayout();
    window.addEventListener('resize', updateWorkspaceLayout);

    if (!window.ResizeObserver) {
      return () => window.removeEventListener('resize', updateWorkspaceLayout);
    }

    const observer = new ResizeObserver(updateWorkspaceLayout);
    observer.observe(getScrollElement() ?? document.body);
    observer.observe(document.getElementById('heading') ?? document.body);
    return () => {
      window.removeEventListener('resize', updateWorkspaceLayout);
      observer.disconnect();
    };
  }, [getScrollElement, updateWorkspaceLayout]);
  useEffect(() => {
    columnVirtualizer.measure();
  }, [columnVirtualizer, resolvedDumpColumnWidth]);

  const virtualRows = rowVirtualizer.getVirtualItems();
  const virtualColumns = columnVirtualizer.getVirtualItems().filter((column) => column.index > 0);
  const totalHeight = rowVirtualizer.getTotalSize();
  const totalWidth = columnVirtualizer.getTotalSize();
  const dataWidth = totalWidth - threadsOverviewGridMetrics.threadNameColumnWidth;
  const gridStyle = {
    '--threads-overview-grid-header-height': `${threadsOverviewGridMetrics.headerHeight}px`,
    '--threads-overview-grid-name-column-width': `${threadsOverviewGridMetrics.threadNameColumnWidth}px`,
    '--threads-overview-grid-data-width': `${dataWidth}px`,
    height: threadsOverviewGridMetrics.headerHeight + totalHeight,
    width: totalWidth,
  } as React.CSSProperties;

  return (
    <div
      ref={gridRef}
      className="threads-overview-grid"
      role="grid"
      aria-colcount={dates.length + 1}
      aria-rowcount={rows.length}
      style={gridStyle}
    >
      <div className="threads-overview-grid-corner" role="columnheader" aria-colindex={1}>
        Thread Name / Time
      </div>
      <div className="threads-overview-grid-header" role="row">
        <div className="threads-overview-grid-header-content">
          {virtualColumns.map((column) => {
            const dumpIndex = column.index - 1;
            return (
              <div
                key={column.key}
                className="threads-overview-grid-header-cell"
                role="columnheader"
                aria-colindex={column.index + 1}
                style={{
                  transform: `translateX(${column.start - threadsOverviewGridMetrics.threadNameColumnWidth}px)`,
                  width: column.size,
                }}
              >
                <HoverPopup content={dates[dumpIndex] || ''}>
                  {dates[dumpIndex]}
                </HoverPopup>
              </div>
            );
          })}
        </div>
      </div>
      <div className="threads-overview-grid-names">
        <div className="threads-overview-grid-names-content">
          {virtualRows.map((row) => {
            const threadRow = rows[row.index];
            return (
              <div
                key={row.key}
                className="threads-overview-grid-name-cell"
                role="rowheader"
                aria-rowindex={row.index + 1}
                style={{
                  transform: `translateY(${row.start - rowScrollMargin}px)`,
                  height: row.size,
                }}
              >
                <HoverPopup content={threadRow.name}>{threadRow.name}</HoverPopup>
              </div>
            );
          })}
        </div>
      </div>
      <div className="threads-overview-grid-body" data-testid="threads-overview-grid-body">
        <div className="threads-overview-grid-body-content">
          {virtualRows.flatMap((row) => {
            const threadRow = rows[row.index];
            return virtualColumns.map((column) => {
              const dumpIndex = column.index - 1;
              const thread = threadRow.threadsByDump.get(dumpIndex);
              return (
                <ThreadsOverviewItem
                  key={`${row.key}-${column.key}`}
                  thread={thread}
                  isMatchingStackFilter={thread ? matchingStackFilter.has(thread.uniqueId) : false}
                  stackPreviewLines={stackPreviewLines}
                  onOpenThreadDetails={onOpenThreadDetails}
                  rowIndex={row.index + 1}
                  columnIndex={column.index + 1}
                  style={{
                    transform: `translate(${column.start - threadsOverviewGridMetrics.threadNameColumnWidth}px, ${row.start - rowScrollMargin}px)`,
                    width: column.size,
                    height: row.size,
                  }}
                />
              );
            });
          })}
        </div>
      </div>
    </div>
  );
};

export default ThreadsOverviewVirtualGrid;
