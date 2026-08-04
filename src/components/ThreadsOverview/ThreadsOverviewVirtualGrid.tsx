import { useVirtualizer } from '@tanstack/react-virtual';
import React, {
  useCallback, useEffect, useLayoutEffect, useRef, useState,
} from 'react';
import HoverPopup from '../common/HoverPopup';
import Thread from '../../types/Thread';
import ThreadsOverviewItem from './ThreadOverviewItem';
import {
  getAvailableThreadsOverviewGridHeight,
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
  onOpenThreadDetails: (thread: Thread) => void;
}

// Virtualized body cells are absolutely positioned, so frozen headers and names
// live in separate regions synchronized with the scrollable body.
const ThreadsOverviewVirtualGrid: React.FC<Props> = ({
  dates,
  rows,
  matchingStackFilter,
  dumpColumnWidth,
  stackPreviewLines,
  onOpenThreadDetails,
}) => {
  const rowIds = rows.map((row) => row.id).join(',');
  const gridRef = useRef<HTMLDivElement>(null);
  const headerContentRef = useRef<HTMLDivElement>(null);
  const namesContentRef = useRef<HTMLDivElement>(null);
  const previousRowIdsRef = useRef(rowIds);
  const scrollElementRef = useRef<HTMLDivElement>(null);
  const [availableGridHeight, setAvailableGridHeight] = useState(0);
  const [bodyWidth, setBodyWidth] = useState(0);

  const resolvedDumpColumnWidth = getResolvedThreadsOverviewDumpColumnWidth(
    dumpColumnWidth,
    dates.length,
    bodyWidth,
  );

  // TanStack Virtual owns external scroll state, which React Compiler cannot memoize safely.
  // eslint-disable-next-line react-hooks/incompatible-library
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollElementRef.current,
    estimateSize: () => threadsOverviewGridMetrics.rowHeight,
    getItemKey: (index) => rows[index].id,
    initialRect: { width: 1024, height: 700 },
    overscan: 2,
  });
  const columnVirtualizer = useVirtualizer({
    count: dates.length,
    getScrollElement: () => scrollElementRef.current,
    horizontal: true,
    estimateSize: () => resolvedDumpColumnWidth,
    initialRect: { width: 1024, height: 700 },
    overscan: 1,
  });

  useEffect(() => {
    if (previousRowIdsRef.current === rowIds) return;

    previousRowIdsRef.current = rowIds;
    const scrollElement = scrollElementRef.current;
    if (!scrollElement) return;

    scrollElement.scrollTop = 0;
    if (namesContentRef.current) namesContentRef.current.style.transform = 'translateY(0px)';
  }, [rowIds]);
  useEffect(() => {
    columnVirtualizer.measure();
  }, [columnVirtualizer, resolvedDumpColumnWidth]);
  const updateAvailableGridHeight = useCallback(() => {
    const grid = gridRef.current;
    if (!grid) return;

    const nextHeight = getAvailableThreadsOverviewGridHeight(
      window.innerHeight,
      grid.getBoundingClientRect().top,
    );
    setAvailableGridHeight((currentHeight) => (
      currentHeight === nextHeight ? currentHeight : nextHeight
    ));
  }, []);
  useLayoutEffect(() => {
    updateAvailableGridHeight();
    window.addEventListener('resize', updateAvailableGridHeight);

    if (!window.ResizeObserver) {
      return () => window.removeEventListener('resize', updateAvailableGridHeight);
    }

    const layoutObserver = new ResizeObserver(updateAvailableGridHeight);
    layoutObserver.observe(document.getElementById('settings') ?? document.body);
    return () => {
      window.removeEventListener('resize', updateAvailableGridHeight);
      layoutObserver.disconnect();
    };
  }, [dates.length, dumpColumnWidth, rowIds, stackPreviewLines, updateAvailableGridHeight]);
  useEffect(() => {
    const scrollElement = scrollElementRef.current;
    if (!scrollElement || !window.ResizeObserver) return undefined;

    const updateBodyWidth = () => setBodyWidth(scrollElement.clientWidth);
    const observer = new ResizeObserver(updateBodyWidth);
    updateBodyWidth();
    observer.observe(scrollElement);
    return () => observer.disconnect();
  }, []);

  const handleScroll: React.UIEventHandler<HTMLDivElement> = ({ currentTarget }) => {
    if (headerContentRef.current) {
      headerContentRef.current.style.transform = `translateX(${-currentTarget.scrollLeft}px)`;
    }
    if (namesContentRef.current) {
      namesContentRef.current.style.transform = `translateY(${-currentTarget.scrollTop}px)`;
    }
  };

  const virtualRows = rowVirtualizer.getVirtualItems();
  const virtualColumns = columnVirtualizer.getVirtualItems();
  const totalHeight = rowVirtualizer.getTotalSize();
  const totalWidth = columnVirtualizer.getTotalSize();
  const gridHeight = availableGridHeight || threadsOverviewGridMetrics.headerHeight + totalHeight;
  const gridStyle = {
    '--threads-overview-grid-header-height': `${threadsOverviewGridMetrics.headerHeight}px`,
    '--threads-overview-grid-name-column-width': `${threadsOverviewGridMetrics.threadNameColumnWidth}px`,
    height: gridHeight,
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
        <div
          ref={headerContentRef}
          className="threads-overview-grid-header-content"
          style={{ width: totalWidth }}
        >
          {virtualColumns.map((column) => (
            <div
              key={column.key}
              className="threads-overview-grid-header-cell"
              role="columnheader"
              aria-colindex={column.index + 2}
              style={{
                transform: `translateX(${column.start}px)`,
                width: column.size,
              }}
            >
              <HoverPopup content={dates[column.index] || ''}>
                {dates[column.index]}
              </HoverPopup>
            </div>
          ))}
        </div>
      </div>
      <div className="threads-overview-grid-names">
        <div
          ref={namesContentRef}
          className="threads-overview-grid-names-content"
          style={{ height: totalHeight }}
        >
          {virtualRows.map((row) => {
            const threadRow = rows[row.index];
            return (
              <div
                key={row.key}
                className="threads-overview-grid-name-cell"
                role="rowheader"
                aria-rowindex={row.index + 1}
                style={{
                  transform: `translateY(${row.start}px)`,
                  height: row.size,
                }}
              >
                <HoverPopup content={threadRow.name}>{threadRow.name}</HoverPopup>
              </div>
            );
          })}
        </div>
      </div>
      <div
        ref={scrollElementRef}
        className="threads-overview-grid-body"
        data-testid="threads-overview-grid-body"
        onScroll={handleScroll}
      >
        <div
          className="threads-overview-grid-body-content"
          style={{ height: totalHeight, width: totalWidth }}
        >
          {virtualRows.flatMap((row) => {
            const threadRow = rows[row.index];
            return virtualColumns.map((column) => {
              const thread = threadRow.threadsByDump.get(column.index);
              return (
                <ThreadsOverviewItem
                  key={`${row.key}-${column.key}`}
                  thread={thread}
                  isMatchingStackFilter={thread ? matchingStackFilter.has(thread.uniqueId) : false}
                  stackPreviewLines={stackPreviewLines}
                  onOpenThreadDetails={onOpenThreadDetails}
                  rowIndex={row.index + 1}
                  columnIndex={column.index + 2}
                  style={{
                    transform: `translate(${column.start}px, ${row.start}px)`,
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
