import {
  PointerEvent as ReactPointerEvent, useEffect, useMemo, useRef, useState,
} from 'react';
import {
  filterThreadDumpsByTimeWindow,
  getClosestTimestamp,
  getThreadDumpTimestamps,
  TimeWindow,
} from '../../common/timeWindow';
import { useTimeWindow } from '../../context/TimeWindowContext';
import './TimeWindowFilter.css';
import '../common/ExpandableSurface.css';

const MAX_RECOMMENDED_THREAD_DUMPS = 100;

type DragMode = 'start' | 'end' | 'window';

const formatTime = (epoch: number): string => {
  const date = new Date(epoch);
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  const seconds = String(date.getUTCSeconds()).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
};

const formatDate = (epoch: number): string => {
  const date = new Date(epoch);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const sameCalendarDay = (firstEpoch: number, secondEpoch: number): boolean => {
  const first = new Date(firstEpoch);
  const second = new Date(secondEpoch);
  return first.getUTCFullYear() === second.getUTCFullYear()
    && first.getUTCMonth() === second.getUTCMonth()
    && first.getUTCDate() === second.getUTCDate();
};

const formatWindow = (timeWindow: TimeWindow): string => (
  sameCalendarDay(timeWindow.startEpoch, timeWindow.endEpoch)
    ? `${formatTime(timeWindow.startEpoch)} - ${formatTime(timeWindow.endEpoch)}`
    : `${formatDate(timeWindow.startEpoch)} ${formatTime(timeWindow.startEpoch)} - ${formatDate(timeWindow.endEpoch)} ${formatTime(timeWindow.endEpoch)}`
);

const timeWindowEquals = (first: TimeWindow, second: TimeWindow): boolean => (
  first.startEpoch === second.startEpoch && first.endEpoch === second.endEpoch
);

const clamp = (value: number, minimum: number, maximum: number): number => (
  Math.min(Math.max(value, minimum), maximum)
);

const epochAtPosition = (position: number, bounds: TimeWindow): number => (
  Math.round(bounds.startEpoch + (position * (bounds.endEpoch - bounds.startEpoch)))
);

const positionForEpoch = (epoch: number, bounds: TimeWindow): number => (
  (epoch - bounds.startEpoch) / (bounds.endEpoch - bounds.startEpoch)
);

const updateEpochFromTimeInput = (value: string, currentEpoch: number): number | undefined => {
  if (!value) {
    return undefined;
  }

  const [hours, minutes, seconds = '0'] = value.split(':');
  const currentDate = new Date(currentEpoch);
  return Date.UTC(
    currentDate.getUTCFullYear(),
    currentDate.getUTCMonth(),
    currentDate.getUTCDate(),
    Number(hours),
    Number(minutes),
    Number(seconds),
  );
};

const updateEpochFromDateInput = (value: string, currentEpoch: number): number | undefined => {
  if (!value) {
    return undefined;
  }

  const [year, month, day] = value.split('-');
  const currentDate = new Date(currentEpoch);
  const epoch = Date.UTC(
    Number(year),
    Number(month) - 1,
    Number(day),
    currentDate.getUTCHours(),
    currentDate.getUTCMinutes(),
    currentDate.getUTCSeconds(),
  );

  return Number.isNaN(epoch) ? undefined : epoch;
};

const WarningIcon = ({ className }: { className: string }): JSX.Element => (
  <svg className={className} viewBox="0 0 16 16" aria-hidden="true">
    <path
      clipRule="evenodd"
      d="M6.242 1.169c.757-1.396 2.76-1.396 3.516 0l5.9 10.878C16.381 13.379 15.416 15 13.9 15H2.1C.584 15-.38 13.38.342 12.047zM7.25 9.5v-5h1.5v5zM8 12.75a1 1 0 1 0 0-2 1 1 0 0 0 0 2"
      fill="currentColor"
      fillRule="evenodd"
    />
  </svg>
);

const TimeWindowFilter = (): JSX.Element | null => {
  const {
    allThreadDumps,
    appliedTimeWindow,
    bounds,
    distinctTimestampCount,
    previewTimeWindow,
    applyPreviewTimeWindow,
    resetPreviewTimeWindow,
    setPreviewTimeWindow,
  } = useTimeWindow();
  const [expanded, setExpanded] = useState(false);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [dragMode, setDragMode] = useState<DragMode>();
  const dragStartPosition = useRef<number | undefined>(undefined);
  const dragStartWindow = useRef<TimeWindow | undefined>(undefined);
  const timeline = useRef<HTMLDivElement>(null);

  const appliedWindow = appliedTimeWindow ?? bounds;
  const previewWindow = previewTimeWindow ?? bounds;
  const includesMultipleDays = bounds ? !sameCalendarDay(bounds.startEpoch, bounds.endEpoch) : false;
  const timestamps = useMemo(() => getThreadDumpTimestamps(allThreadDumps), [allThreadDumps]);
  const previewThreadDumpCount = useMemo(
    () => (previewWindow ? filterThreadDumpsByTimeWindow(allThreadDumps, previewWindow).length : 0),
    [allThreadDumps, previewWindow],
  );
  const hasPendingChanges = Boolean(appliedWindow && previewWindow && !timeWindowEquals(appliedWindow, previewWindow));
  const previewIsLarge = previewThreadDumpCount > MAX_RECOMMENDED_THREAD_DUMPS;
  const appliedThreadDumpCount = appliedWindow
    ? filterThreadDumpsByTimeWindow(allThreadDumps, appliedWindow).length
    : allThreadDumps.length;
  const appliedSummary = appliedWindow
    ? `${formatWindow(appliedWindow)} · showing ${appliedThreadDumpCount} of ${allThreadDumps.length} thread dumps`
    : `showing ${appliedThreadDumpCount} thread dumps`;

  useEffect(() => {
    const startPosition = dragStartPosition.current;
    const startWindow = dragStartWindow.current;
    if (!dragMode || !bounds || !timeline.current || startPosition === undefined || !startWindow) {
      return undefined;
    }

    const handlePointerMove = (event: PointerEvent) => {
      const rect = timeline.current?.getBoundingClientRect();
      if (!rect) {
        return;
      }

      const position = clamp((event.clientX - rect.left) / rect.width, 0, 1);
      const pointerEpoch = epochAtPosition(position, bounds);
      const draggedEpoch = getClosestTimestamp(timestamps, pointerEpoch);
      if (draggedEpoch === undefined) {
        return;
      }

      if (dragMode === 'start') {
        setPreviewTimeWindow({
          startEpoch: Math.min(draggedEpoch, startWindow.endEpoch),
          endEpoch: startWindow.endEpoch,
        });
      } else if (dragMode === 'end') {
        setPreviewTimeWindow({
          startEpoch: startWindow.startEpoch,
          endEpoch: Math.max(draggedEpoch, startWindow.startEpoch),
        });
      } else {
        const startTimestamp = getClosestTimestamp(timestamps, startWindow.startEpoch);
        const endTimestamp = getClosestTimestamp(timestamps, startWindow.endEpoch);
        if (startTimestamp === undefined || endTimestamp === undefined) {
          return;
        }

        const selectedStartIndex = timestamps.indexOf(startTimestamp);
        const selectedEndIndex = timestamps.indexOf(endTimestamp);
        const selectedTimestampSpan = selectedEndIndex - selectedStartIndex;
        const movement = pointerEpoch - epochAtPosition(startPosition, bounds);
        const movedStartTimestamp = getClosestTimestamp(timestamps, startTimestamp + movement);
        if (movedStartTimestamp === undefined) {
          return;
        }

        const movedStartIndex = timestamps.indexOf(movedStartTimestamp);
        const nextStartIndex = clamp(
          movedStartIndex,
          0,
          timestamps.length - selectedTimestampSpan - 1,
        );
        setPreviewTimeWindow({
          startEpoch: timestamps[nextStartIndex],
          endEpoch: timestamps[nextStartIndex + selectedTimestampSpan],
        });
      }
    };

    const stopDragging = () => setDragMode(undefined);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', stopDragging);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', stopDragging);
    };
  }, [bounds, dragMode, setPreviewTimeWindow, timestamps]);

  if (distinctTimestampCount < 2 || !bounds || !appliedWindow || !previewWindow) {
    return null;
  }

  const startDragging = (mode: DragMode, event: ReactPointerEvent<HTMLSpanElement>) => {
    const rect = timeline.current?.getBoundingClientRect();
    if (!rect) {
      return;
    }

    dragStartPosition.current = clamp((event.clientX - rect.left) / rect.width, 0, 1);
    dragStartWindow.current = previewWindow;
    setDragMode(mode);
    event.preventDefault();
  };

  const setPreviewBoundary = (boundary: 'startEpoch' | 'endEpoch', epoch: number | undefined) => {
    if (epoch === undefined) {
      return;
    }

    const boundedEpoch = clamp(epoch, bounds.startEpoch, bounds.endEpoch);
    setPreviewTimeWindow({
      startEpoch: boundary === 'startEpoch' ? Math.min(boundedEpoch, previewWindow.endEpoch) : previewWindow.startEpoch,
      endEpoch: boundary === 'endEpoch' ? Math.max(boundedEpoch, previewWindow.startEpoch) : previewWindow.endEpoch,
    });
  };

  const setPreviewTimeBoundary = (boundary: 'startEpoch' | 'endEpoch', value: string) => {
    setPreviewBoundary(boundary, updateEpochFromTimeInput(value, previewWindow[boundary]));
  };

  const setPreviewDateBoundary = (boundary: 'startEpoch' | 'endEpoch', value: string) => {
    setPreviewBoundary(boundary, updateEpochFromDateInput(value, previewWindow[boundary]));
  };

  const applyPreview = () => {
    if (previewIsLarge) {
      setConfirmationOpen(true);
      return;
    }

    applyPreviewTimeWindow();
  };

  const applyLargePreview = () => {
    applyPreviewTimeWindow();
    setConfirmationOpen(false);
  };

  const appliedIsLarge = appliedThreadDumpCount > MAX_RECOMMENDED_THREAD_DUMPS;
  const noPendingChangesMessage = appliedIsLarge
    ? `Showing ${appliedThreadDumpCount} thread dumps, which may make analysis pages slow.`
    : 'No changes to apply.';
  const pendingChangesMessage = previewIsLarge
    ? `Applying this range will show ${previewThreadDumpCount} thread dumps. Large ranges can slow analysis pages.`
    : `Applying this range will show ${previewThreadDumpCount} thread dumps.`;
  const previewMessage = hasPendingChanges ? pendingChangesMessage : noPendingChangesMessage;
  const largeRangeMessage = `The selected time window covers ${previewThreadDumpCount} thread dumps from ${formatWindow(previewWindow)}.\nLarge time windows can slow analysis pages.`;
  const selectionStart = positionForEpoch(previewWindow.startEpoch, bounds) * 100;
  const selectionWidth = (positionForEpoch(previewWindow.endEpoch, bounds) * 100) - selectionStart;
  return (
    <section className={`expandable-surface${expanded ? ' expandable-surface-expanded' : ''}`}>
      <button
        type="button"
        className="time-window-toggle expandable-surface-toggle"
        aria-expanded={expanded}
        onClick={() => setExpanded((current) => !current)}
      >
        <span className={expanded ? 'chevron' : 'chevron rotate'} />
        <span className="time-window-title">Time window</span>
        <span className="time-window-summary">{appliedSummary}</span>
      </button>

      {expanded && (
        <div className="time-window-controls">
          <div ref={timeline} className="time-window-timeline" aria-label="Time window timeline">
            <span
              className="time-window-selection"
              style={{ left: `${selectionStart}%`, width: `${selectionWidth}%` }}
              onPointerDown={(event) => startDragging('window', event)}
            >
              <span
                className="time-window-handle time-window-handle-start"
                onPointerDown={(event) => {
                  event.stopPropagation();
                  startDragging('start', event);
                }}
              />
              <span
                className="time-window-handle time-window-handle-end"
                onPointerDown={(event) => {
                  event.stopPropagation();
                  startDragging('end', event);
                }}
              />
            </span>
            <div className="time-window-labels">
              <span>{formatTime(bounds.startEpoch)}</span>
              <span>{formatTime(bounds.endEpoch)}</span>
            </div>
          </div>

          <form
            className="time-window-inputs"
            onSubmit={(event) => {
              event.preventDefault();
              applyPreview();
            }}
          >
            <label>
              From
              {includesMultipleDays && (
                <input
                  aria-label="From date"
                  type="date"
                  value={formatDate(previewWindow.startEpoch)}
                  onChange={(event) => setPreviewDateBoundary('startEpoch', event.target.value)}
                />
              )}
              <input
                aria-label="From time"
                type="time"
                step="1"
                value={formatTime(previewWindow.startEpoch)}
                onChange={(event) => setPreviewTimeBoundary('startEpoch', event.target.value)}
              />
            </label>
            <label>
              to
              {includesMultipleDays && (
                <input
                  aria-label="To date"
                  type="date"
                  value={formatDate(previewWindow.endEpoch)}
                  onChange={(event) => setPreviewDateBoundary('endEpoch', event.target.value)}
                />
              )}
              <input
                aria-label="To time"
                type="time"
                step="1"
                value={formatTime(previewWindow.endEpoch)}
                onChange={(event) => setPreviewTimeBoundary('endEpoch', event.target.value)}
              />
            </label>
            <button type="submit" className="primary" disabled={!hasPendingChanges}>Apply</button>
            <button type="button" disabled={!hasPendingChanges} onClick={resetPreviewTimeWindow}>Reset</button>
            <button type="button" onClick={() => setPreviewTimeWindow()}>Show all...</button>
          </form>

          <p className={previewIsLarge && hasPendingChanges ? 'time-window-preview time-window-preview-warning' : 'time-window-preview'}>
            {previewIsLarge && hasPendingChanges && <WarningIcon className="time-window-preview-warning-icon" />}
            <span>{previewMessage}</span>
          </p>
        </div>
      )}

      {confirmationOpen && (
        <div className="time-window-dialog-backdrop">
          <button
            type="button"
            className="time-window-dialog-dismiss"
            aria-label="Close dialog"
            onClick={() => setConfirmationOpen(false)}
          />
          <section
            className="time-window-dialog"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="large-time-window-title"
          >
            <div className="time-window-dialog-header">
              <div className="time-window-dialog-title">
                <WarningIcon className="time-window-dialog-warning-icon" />
                <h2 id="large-time-window-title">Large time window selected</h2>
              </div>
              <button
                type="button"
                className="time-window-dialog-close"
                aria-label="Close dialog"
                onClick={() => setConfirmationOpen(false)}
              >
                ×
              </button>
            </div>
            <p>{largeRangeMessage}</p>
            <div className="time-window-dialog-actions">
              <button type="button" onClick={() => setConfirmationOpen(false)}>Choose smaller window</button>
              <button type="button" className="warning" onClick={applyLargePreview}>Analyze anyway</button>
            </div>
          </section>
        </div>
      )}
    </section>
  );
};

export default TimeWindowFilter;
